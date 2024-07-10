---
title: Vue.jsで別のサイトから読み込まれるサイトを作成
date: 2024-05-16T14:37:00+09:00
tags:
  - Vuejs
---
 
- a-sha.example.com = queryパラメータで指定されたURLのコンテンツを表示する外部サイト
- app.example.com = 実際に表示したいサイト。[[Vue.js]] で作りたい

こういう構成でコンテンツを提供したいときに、 [[Nuxt.js]] で作成しようとしたらルーティングがうまくできなかった。

http://a-sha.example.com/?url=http://app.example.com/contents  でアクセスすると、Nuxt.jsが気を利かせて http://a-sha.example.com/contens?url=http://app.example.com/contents にURLを書き換えてしまう。

## ローカルで再現させる

a-sha.example.com をパラメータで指定されたURLのコンテンツを返却するだけのサーバーとしてGoで立ててみる。

```go
package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {

	http.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		targetUrl := r.URL.Query().Get("url")

		res, err := http.Get(targetUrl)
		if err != nil {
			w.WriteHeader(500)
			fmt.Fprintf(w, "error: %v", err)
			return
		}

		defer res.Body.Close()

		content, err := io.ReadAll(res.Body)
		if err != nil {
			w.WriteHeader(500)
			fmt.Fprintf(w, "error: %v", err)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(200)
		w.Write(content)
	})

	fmt.Println("Listen on 5555...")
	if err := http.ListenAndServe(":5555", nil); err != nil {
		panic(err)
	}
}
```

`go run ./` しておく

### Webサイト

https://nuxt.com/docs/getting-started/installation に従ってNuxt 3で作成して、configを次のようにしてスタートする

```ts
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: "/contents",
  },
});
```

```
$ npx nuxt build
$ npx nuxt start
```

http://localhost:5555/?url=http://localhost:3000/contents で開くと、真っ白なページを開くことはできるが `_nuxt/` 配下のリソースを `http://localhost:5555/_nuxt/` から取得しようとするのでnot foundとなる。
これを回避するために [cdnURL](https://nuxt.com/docs/api/nuxt-config#cdnurl) を設定する

```ts
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: "/contents",
    cdnURL: "http://localhost:3000/contents",
  },
});
```

あとは **どうにかして** CORSを許可すれば `_nuxt` 配下のjsファイルを取得して、画面が表示できる。

ところが画面表示が完了すると `http://localhost:5555/contents?url=http://localhost:3000/contents` にURLが書き換わってしまう。


## Viteで作成する

Nuxtのルーティングや便利機能は諦めてViteでサーバーを立てる。

[experimental.renderBuiltUrl](https://vitejs.dev/guide/build#advanced-base-options) で

```js
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/contents",
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      return "http://localhost:3000/contents/" + filename;
    },
  },
});
```