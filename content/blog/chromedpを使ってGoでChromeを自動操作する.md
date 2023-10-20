---
title: chromedpを使ってGoでChromeを自動操作する
date: 2023-05-28T18:29:44+09:00
tags:
- Go
---

普段の業務でWebページを開いてグラフをキャプチャしたり、勤怠入力をしたりといったルーチンの作業を自動化できないかなと思いました。

こうしたブラウザの操作を自動化する分野では [Selenium](https://www.selenium.dev/ja/documentation/) や [Puppetter](https://pptr.dev) が有名ですが、環境構築が面倒だったのでGopherな自分としてはGoでスクリプトを書きたいと思います。

[chromedp](https://github.com/chromedp/chromedp) はChromeをGoで操作することのできるライブラリです。
[Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) をサポートしていて、スクレイピングでDOMを操作する以外にもこのプロトコルでスクリーンショットを取ったりすることもできます。

{{< card-link "https://github.com/chromedp/chromedp" >}}

Headless Chromeを新規で立ち上げることもできるし、起動済みのChromeを操作することもできます。

Pure Goなので当然シングルバイナリでどこでも動かせますので、サーバーにおいてcronで実行するのも用意です。

## 使い方

https://github.com/chromedp/examples に利用例がいくつかあるので、まずはそちらを見てイメージを掴むのがおすすめです。

### headlessモードで起動する

デフォルトではこちらで起動します。

````go
package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/chromedp/chromedp"
)

func main() {
	dir, err := os.MkdirTemp("", "chromedp-example")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)

	// オプションを指定する
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.DisableGPU,
		chromedp.UserDataDir(dir),
	)

	// Headless Chromeを起動する
	ctx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	// Chromeを起動する
	if err := chromedp.Run(ctx,
		chromedp.Navigate("https://example.com/"),
		chromedp.Sleep(time.Second),
	); err != nil {
		log.Fatal(err)
	}

	path := filepath.Join(dir, "DevToolsActivePort")
	bs, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}
	lines := bytes.Split(bs, []byte("\n"))
	fmt.Printf("DevToolsActivePort has %d lines\n", len(lines))

}
````

起動したり操作をする際は、context.Contextを渡すようにします。

### 起動済みのChromeを操作する

SSOや2要素認証が必要なサイトを操作したい場合に、認証を突破するコードを書くのが面倒なので、予めログインまでしてある状態のChromeを操作することにした。

まず、ChromeをDevTools protocolを有効にした状態で起動します。

````shell
$ open -a 'Google Chrome' --args --remote-debugging-port=9222
````

それを指定してchromedpを実行するコードを書きます。

````go
func main() {
	devtoolsWsURL := flag.String("-ws-url", "ws://localhost:9222", "DevTools WebSocket URL")
	flag.Parse()
	if *devtoolsWsURL == "" {
		log.Fatal("must specify -ws-url")
	}

	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, 120*time.Second)
	defer cancel()

	// NewRemoteAllocatorにWebSocketのURLを指定して起動する
	allocatorContext, cancel := chromedp.NewRemoteAllocator(ctx, *devtoolsWsURL)
	defer cancel()

	ctx, cancel = chromedp.NewContext(allocatorContext)
	defer cancel()

	var img []byte
	quality := 100
	if err := chromedp.Run(ctx,
		chromedp.Navigate("https://secure.example.com"),
		chromedp.WaitVisible("#footer"),
		chromedp.FullScreenshot(&img, quality),
	); err != nil {
		log.Fatalf("Failed: %v", err)
	}

}
````

### Docker上で実行する

https://github.com/chromedp/chromedp#frequently-asked-questions

こちらで紹介されている `chromedp/headless-shell` を使います。

https://github.com/chromedp/docker-headless-shell

chromedpを使ったアプリケーションをビルドして、 `chromedp/headless-shell` 上で実行するには以下のようにします。

````dockerfile
FROM golang:1.20 as build-env
WORKDIR /work
COPY go.mod go.sum .
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -trimpath -o /work/app

FROM chromedp/headless-shell:latest

COPY --from=build-env /work/app /usr/local/bin/app
ENTRYPOINT ["app"]
````

````shell
$ docker build -t myimage .
$ docker run -d -p 9222:9222 --rm --name headless-shell --shm-size 2G myimage
````

## サンプル

### スクリーンショットを撮る

未指定の場合pngで保存されます。

````go
var img []byte
err := chromedp.Run(taskCtx,
	chromedp.Navigate(url),
	chromedp.CaptureScreenshot(&img),
)

f, err := os.Create("tmp.png")
if err != nil {
	log.Fatal(err)
}
defer f.Close()
f.Write(img)
````

### formに入力する

要素を選択するselectorは、 [XPath](note/XPath.md) やCSSセレクタが使用可能です。
CSSセレクタの場合は引数に `chromedp.ByQuery` を指定してください。

````go
err := chromedp.Run(taskCtx,
	chromedp.Navigate(url),

	chromedp.SetValue(`//*[@id="signInFormUsername"]`, `user`),
	chromedp.SetValue(`//*[@id="signInFormPassword"]`, `password`),
	chromedp.Submit(`//*[@id="signInForm"]`),
)

````

### 複雑なActionを定義する

`chromedp.Run` の引数のactionsには、`chromdp.Tasks` を渡すこともできます。
なので以下のようにTasksを生成する関数を切り出すといったことが可能です。

````go
func tasks(url string) chromedp.Tasks {
	tasks := chromedp.Tasks{
		chromedp.Navigate(url),
		chromedp.Sleep(3 * time.Second),
	}
	return tasks
}


err := chromedp.Run(taskCtx, tasks())
````

また、`chromedp.ActionFunc` に任意の処理を記述することが可能です。
その際は、各処理の末尾に `.Do(ctx)` を渡します。

````go
chromedp.ActionFunc(func(ctx context.Context) error {
	chromedp.Sleep(5 * time.Second).Do(ctx)
	return nil
}),
````

### ある要素のロードを待つ

````go
chromedp.ActionFunc(func(ctx context.Context) error {
	var err error
	queryLoading := `//div[@class="loading"]`
	// 表示されるのを待つ
	err = chromedp.WaitVisible(queryLoading).Do(ctx)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			fmt.Println("timeout")
			return nil
		}
		return err
	}
	// 表示されなくなるのを待つ
	chromedp.WaitNotPresent(queryLoading).Do(ctx)

	// 要素が4つ表示されるまで待つ
	queryChartContainer := `//div[@class="graph"]`
	var nodes []*cdp.Node
	for len(nodes) < 4 {
		err = chromedp.Nodes(queryChartContainer, &nodes).Do(ctx)
		if err != nil {
			if errors.Is(err, context.DeadlineExceeded) {
				fmt.Println("timeout")
				return nil
			}
			return err
		}
		time.Sleep(1 * time.Second)
	}

})
````

### ある要素のtextを取得する

````go
var users []string
chromedp.ActionFunc(func(ctx context.Context) error {
	for i := 0; i < 10; i++ {
		var t string
		chromedp.Text(`//li[@class="users"]`, &t).Do(ctx)
		users = append(users, t)
	}
	return nil
})
````

### JavaScriptを実行する

JavaScriptを実行するには、`chromdp.Evaluate` を使います。

````go
// #users直下の要素数を出力する
chromedp.ActionFunc(func(ctx context.Context) error {
	var res int
	chromedp.Evaluate(`document.getElementById('users').childElementCount`, &res).Do(ctx)
	fmt.Printf("users count: %d\n", res)
	return nil
}),
````

## Tips

### Docker上で実行したときにスクリーンショットが取れない場合

`Unable to capture screenshot (-32000)` というエラーでスクリーンショットの取得に失敗する場合があります。

https://github.com/chromedp/chromedp/issues/1215

その場合は、[--shm-size](https://docs.docker.jp/engine/reference/run.html)で `/dev/shm` (共有メモリ)のサイズを増やしてください。

````shell
docker run --shm-size 2g chromedp
````
