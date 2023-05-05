---
title: Goでhttpコネクションを再利用されるように書く
date: 2022-05-06T19:31:00+09:00
tags:
- Go
lastmod: 2022-05-06T19:31:00+09:00
---

\#Go

* responseを捨ててしまうと、resp.Body.Close() ができなくなるのでだめ
* 最後まで読み切ってCloseしてないとkeep-aliveしない
* for-loopの中でリクエストする場合きっちり毎回Closeする

[Goのnet/httpのclientでなぜresponseBodyをClose、読み切らなくてはいけないのか](https://zenn.dev/cube/articles/4ce18a672fc991)

1. responseBodyをCloseしないとコネクションがブロックしてしまい再利用されず、古い接続が残ったまま、新しく接続するたびに新しいGoroutineとファイルディスクリプタを作ってしまう
1. responseBodyを読み切らないとkeepAliveされずコネクションが終了してしまい再利用されず、接続のたびに新しい接続を作ってしまう。

[Connection re-use in Golang with http.Client - stuartleeks.com](https://stuartleeks.com/posts/connection-re-use-in-golang-with-http-client/)

* bodyを読み切り、Closeを行う

`DefaultClient` を使う:

````go
    // Uses http.DefaultClient which in turn uses the same http.DefaultTransport instance
    http.Get("http://example.com")
````

`Transport` を指定しない(`DefaultTransport` が使われる):

````go
    // Transport not set, so http.DefaultTransport instance is used
    client := &http.Client{}
    client.Get("http://example.com")
````

同じ `Transport` を使う:

````go
    // Transport set to a cached value
    client := &http.Client{
        Transport: transport, // assuming that transport is a fixed value for this example!
    }
    client.Get("http://example.com")
````

再利用されないケース: `http.Client` ごとに `Transport` を作る

````go
    // New Transport for each client/call means that connections cannot be re-used
    // This leads to port exhaustion under load :-(
    client := &http.Client{
        Transport: &http.Transport{
            // insert config here
        },
    }
    client.Get("http://example.com")
````
