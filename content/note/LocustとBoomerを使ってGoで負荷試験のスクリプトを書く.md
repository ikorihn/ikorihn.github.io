---
title: LocustとBoomerを使ってGoで負荷試験のスクリプトを書く
date: 2023-01-05T18:13:00+09:00
tags:
- 2023/01/05
- Go
- loadtest
---

[DMMプラットフォームを支える負荷試験基盤 - Speaker Deck](https://speakerdeck.com/yuyu_hf/cndt-2022-dmm-load-testing-platform-for-dmm-platform)
[gRPC + Locust + boomerで負荷試験をしてみた - Qiita](https://qiita.com/shka0909/items/ea0ec3ddaecb3dfa8239)

[Locust](note/Locust.md) は通常 [Python](note/Python.md) で負荷試験のスクリプトを書くことになる。
チームの技術スタックに合わせて [Go](note/Go.md) で負荷試験の処理を書きたくなったので、
[Boomer](https://github.com/myzhan/boomer) を調べてみた。
Go製のツールということでは[k6](note/負荷試験%20k6について.md) もあるけど、こちらはシナリオを [JavaScript](note/JavaScript.md) で書くのと、実行環境は変えたくなかったため一旦見送ったk。

## シナリオを作成

ライブラリを取得

````shell
$ go get -u github.com/myzhan/boomer@master
````

v1.6.0時点では、masterを指定しないと次のエラーが出てlocust masterと接続できなかった。
`An old (pre 2.0) worker tried to connect (xxx). That's not going to work`
https://github.com/myzhan/boomer/issues/160

シナリオ `main.go`

````go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/myzhan/boomer"
)

func hello(url string) func() {
	return func() {
		// レスポンスタイムを計測するために、リクエストを投げる前の時刻を取得する
		start := time.Now()
		resp, err := http.Get(url)
		if err != nil {
			log.Fatalf("%+v", err)
		}
		defer resp.Body.Close()

		b, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("%+v", err)
		}

		if resp.StatusCode >= 400 {
			// リクエストに失敗した場合はRecordFailureを呼びます
			boomer.RecordFailure(
				"http",
				url,
				time.Since(start).Nanoseconds()/int64(time.Millisecond),
				fmt.Sprintf("failed: %+v", err),
			)
		} else {
			// リクエストに成功した場合はRecordSuccessを呼びます
			boomer.RecordSuccess(
				"http",
				url,
				time.Since(start).Nanoseconds()/int64(time.Millisecond),
				int64(len(b)),
			)
		}
	}
}

func main() {
	tasks := make([]*boomer.Task, 0)
	urls := []string{"http://localhost:3000/hello", "http://localhost:3000/nothing"}
	for _, url := range urls {
		task := &boomer.Task{
			Name:   "hello",
			Weight: 10,
			Fn:     hello(url),
		}
		tasks = append(tasks, task)
	}
	boomer.Run(tasks...)
}
````

## masterを起動する

適当なlocustfileを作成

`dummy.py`

````python
from locust import HttpUser, task

class HelloWorldUser(HttpUser):
    @task
    def hello_world(self):
        print("hello")
````

dockerでlocustを実行する

````shell
docker run -p 8089:8089 -p 5557:5557 -v $PWD:/mnt/locust locustio/locust --master -f /mnt/locust/dummy.py
````

Web UIは8089、workerとの通信は5557
https://boomer.readthedocs.io/en/latest/options.html

localhost:8089でWeb UIが開く

この状態でworkerを実行する

````shell
$ go run main.go
````

するとWORKERSに登録される

![Pasted-image-20230110180714](note/Pasted-image-20230110180714.png)

これでNumber of usersやSpawn rateを設定してStartを押せば負荷リクエストが開始される。
