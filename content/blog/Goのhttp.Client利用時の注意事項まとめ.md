---
title: Goのhttp.Client利用時の注意事項まとめ
date: 2024-07-16T12:31:00+09:00
tags:
  - Go
---

## はじめに

GoでHTTPリクエストを送信する際、net/httpパッケージのClientを使用すると思います。
この記事では、http.Clientを使ってリクエストを送信する際の注意事項についてまとめます。

- response Bodyは最後まで読み切ったあと必ずCloseする
- アプリケーション全体でひとつの `http.Transport` を使い回す
- `Transport` をカスタマイズしたい場合は `DefaultTransport` をCloneする
- `MaxIdleConnsPerHost` を大きくする
- タイムアウトを設定する

## 実験用コード

まずhttp serverを立てます。

`server/main.go`

```go
package main

import (
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("GET /get", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(500 * time.Millisecond)

		w.Write([]byte("OK"))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
```

=> これを `go run ./` で8080番ポートで起動しておきます。

つぎにこのサーバーにリクエストするクライアントを作成します。

`client/main.go`

```go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptrace"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	dt := http.DefaultTransport.(*http.Transport).Clone()
	dt.MaxIdleConnsPerHost = 100
	client := &http.Client{
		Transport: dt,
		Timeout:   10 * time.Second,
	}

	limit := 10
	slots := make(chan struct{}, limit)

	var counter atomic.Int32

	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)

		slots <- struct{}{}
		go func() {
			defer wg.Done()
			att := counter.Add(1)

			req, err := http.NewRequest("GET", "http://localhost:8080/get", nil)
			if err != nil {
				log.Fatal(err)
			}

			var connReused bool
			var localAddr string
			ctx := httptrace.WithClientTrace(
				req.Context(),
				&httptrace.ClientTrace{
					GotConn: func(ci httptrace.GotConnInfo) {
						connReused = ci.Reused
						localAddr = ci.Conn.LocalAddr().String()
					},
				},
			)
			req = req.WithContext(ctx)

			res, err := client.Do(req)
			if err != nil {
				log.Fatal(err)
			}

			time.Sleep(1 * time.Second)

			io.Copy(io.Discard, res.Body)
			res.Body.Close()

			// Show results
			fmt.Printf("Attempt %d. conn reused=%v, port=%s\n", att, connReused, localAddr)
			<-slots
		}()
	}
	wg.Wait()
}
```

=> コネクションが再利用されているかどうかと、クライアントのポートが出力されます。

### まずこの状態で実行する

```shell
❯ go run ./
Attempt 1. conn reused=false, port=[::1]:61183
Attempt 10. conn reused=false, port=[::1]:61179
Attempt 2. conn reused=false, port=[::1]:61186
Attempt 6. conn reused=false, port=[::1]:61185
Attempt 4. conn reused=false, port=[::1]:61187
Attempt 7. conn reused=false, port=[::1]:61188
Attempt 3. conn reused=false, port=[::1]:61181
Attempt 9. conn reused=false, port=[::1]:61184
Attempt 8. conn reused=false, port=[::1]:61182
Attempt 5. conn reused=false, port=[::1]:61180
Attempt 19. conn reused=true, port=[::1]:61182
Attempt 14. conn reused=true, port=[::1]:61187
Attempt 11. conn reused=true, port=[::1]:61179
Attempt 12. conn reused=true, port=[::1]:61181
Attempt 16. conn reused=true, port=[::1]:61183
Attempt 13. conn reused=true, port=[::1]:61185
Attempt 20. conn reused=true, port=[::1]:61184
Attempt 15. conn reused=true, port=[::1]:61188
Attempt 18. conn reused=true, port=[::1]:61180
Attempt 17. conn reused=true, port=[::1]:61186
Attempt 29. conn reused=true, port=[::1]:61180
Attempt 24. conn reused=true, port=[::1]:61183
Attempt 26. conn reused=true, port=[::1]:61184
Attempt 23. conn reused=true, port=[::1]:61182
Attempt 22. conn reused=true, port=[::1]:61179
Attempt 30. conn reused=true, port=[::1]:61186
Attempt 28. conn reused=true, port=[::1]:61188
Attempt 27. conn reused=true, port=[::1]:61185
Attempt 21. conn reused=true, port=[::1]:61181
Attempt 25. conn reused=true, port=[::1]:61187
...
```

2周目以降(Attempt 10よりあと)はコネクションが再利用されていることがわかります。

## response Bodyは最後まで読み切ったあと必ずCloseする

サンプルコードのこの部分です。

```go
			io.Copy(io.Discard, res.Body)
			res.Body.Close()
```

ドキュメントにあるのですが、keep-aliveされたTCPコネクションを再利用するには条件があります。

https://github.com/golang/go/blob/70491a81113e7003e314451f3e3cf134c4d41dd7/src/net/http/response.go#L59-L65

> It is the caller's responsibility to close Body. The default HTTP client's Transport may not reuse HTTP/1.x "keep-alive" TCP connections if the Body is not read to completion and closed.

- response.BodyをCloseする
- response.Bodyを最後まで読み切る

こうしないと古い接続が残ったまま、リクエストするたびに新しいコネクションを作ってしまい、file descriptorのリークにもつながります。

特に、responseを使わないときに `_, err = client.Do(req)` と書いてしまいたくなりますが、これではコネクションが再利用されないので注意です。
使わないのであれば上記のように `io.Discard` (いわゆる `/dev/null`)に書き出しましょう。

Bodyを使いたい場合は `io.ReadAll(res.Body)` や `json.NewDecoder(res.Body).Decode(v)` で読み切るようにしましょう、

またfor loopの中でリクエストする場合もループごとに毎回Closeされるように書いてあげるのが良いのですが、ループ内でクロージャなどを使わずに `defer resp.Body.Close()` と書くと関数を抜けるまでCloseされないので気をつけましょう。

### これをしないとどうなるの？

試してみます。

```diff
                        )
                        req = req.WithContext(ctx)

-                       res, err := client.Do(req)
+                       _, err = client.Do(req)
                        if err != nil {
                                log.Fatal(err)
                        }

                        time.Sleep(1 * time.Second)

-                       io.Copy(io.Discard, res.Body)
-                       res.Body.Close()
-
                        // Show results
                        fmt.Printf("Attempt %d. conn reused=%v, port=%s\n", att, connReused, localAddr)
                        <-slots
```

コネクションが再利用されず、毎回接続していることがわかります。

```
❯ go run ./
Attempt 1. conn reused=false, port=[::1]:61929
Attempt 3. conn reused=false, port=[::1]:61931
Attempt 7. conn reused=false, port=[::1]:61934
Attempt 5. conn reused=false, port=[::1]:61930
Attempt 8. conn reused=false, port=[::1]:61925
Attempt 4. conn reused=false, port=[::1]:61933
Attempt 6. conn reused=false, port=[::1]:61926
Attempt 9. conn reused=false, port=[::1]:61928
Attempt 2. conn reused=false, port=[::1]:61927
Attempt 10. conn reused=false, port=[::1]:61932
Attempt 17. conn reused=false, port=[::1]:61944
Attempt 15. conn reused=false, port=[::1]:61939
Attempt 13. conn reused=false, port=[::1]:61940
Attempt 20. conn reused=false, port=[::1]:61937
Attempt 18. conn reused=false, port=[::1]:61941
Attempt 12. conn reused=false, port=[::1]:61943
Attempt 16. conn reused=false, port=[::1]:61935
Attempt 19. conn reused=false, port=[::1]:61942
Attempt 14. conn reused=false, port=[::1]:61938
Attempt 11. conn reused=false, port=[::1]:61936
Attempt 27. conn reused=false, port=[::1]:61951
Attempt 24. conn reused=false, port=[::1]:61953
Attempt 29. conn reused=false, port=[::1]:61956
Attempt 26. conn reused=false, port=[::1]:61957
Attempt 22. conn reused=false, port=[::1]:61960
Attempt 28. conn reused=false, port=[::1]:61958
Attempt 23. conn reused=false, port=[::1]:61954
Attempt 21. conn reused=false, port=[::1]:61952
Attempt 25. conn reused=false, port=[::1]:61959
Attempt 30. conn reused=false, port=[::1]:61955
```

### Bodyを読みきらずCloseだけするとどうなる

```diff
-                       io.Copy(io.Discard, res.Body)
```

```
❯ go run ./
Attempt 9. conn reused=false, port=[::1]:61997
Attempt 7. conn reused=false, port=[::1]:61989
Attempt 3. conn reused=false, port=[::1]:61988
Attempt 6. conn reused=false, port=[::1]:61991
Attempt 8. conn reused=false, port=[::1]:61990
Attempt 4. conn reused=false, port=[::1]:61993
Attempt 2. conn reused=false, port=[::1]:61995
Attempt 10. conn reused=false, port=[::1]:61994
Attempt 5. conn reused=false, port=[::1]:61996
Attempt 1. conn reused=false, port=[::1]:61992
Attempt 11. conn reused=false, port=[::1]:61998
Attempt 13. conn reused=false, port=[::1]:62004
Attempt 14. conn reused=false, port=[::1]:62006
Attempt 15. conn reused=false, port=[::1]:62002
Attempt 16. conn reused=false, port=[::1]:62005
Attempt 20. conn reused=false, port=[::1]:62001
Attempt 17. conn reused=false, port=[::1]:62003
Attempt 18. conn reused=false, port=[::1]:62007
Attempt 12. conn reused=false, port=[::1]:61999
Attempt 19. conn reused=false, port=[::1]:62000
Attempt 28. conn reused=false, port=[::1]:62015
```

=> すべてのコネクションが都度確立されています。

### Bodyを最後まで読み切ってCloseしないとどうなる

```diff
-                       res.Body.Close()
```

```
❯ go run ./
Attempt 9. conn reused=false, port=[::1]:62047
Attempt 8. conn reused=false, port=[::1]:62041
Attempt 5. conn reused=false, port=[::1]:62043
Attempt 2. conn reused=false, port=[::1]:62044
Attempt 3. conn reused=false, port=[::1]:62048
Attempt 6. conn reused=false, port=[::1]:62040
Attempt 7. conn reused=false, port=[::1]:62049
Attempt 4. conn reused=false, port=[::1]:62045
Attempt 10. conn reused=false, port=[::1]:62046
Attempt 1. conn reused=false, port=[::1]:62042
Attempt 12. conn reused=true, port=[::1]:62044
Attempt 13. conn reused=true, port=[::1]:62047
Attempt 11. conn reused=false, port=[::1]:62054
Attempt 18. conn reused=false, port=[::1]:62052
Attempt 14. conn reused=true, port=[::1]:62043
Attempt 15. conn reused=true, port=[::1]:62051
Attempt 20. conn reused=false, port=[::1]:62056
Attempt 19. conn reused=false, port=[::1]:62055
Attempt 16. conn reused=true, port=[::1]:62049
Attempt 17. conn reused=true, port=[::1]:62045
```

=> この例では再利用される場合もありました。しかし再利用される数は減っているように見えます。

## アプリケーション全体でひとつの `http.Transport` を使い回す

TCPのコネクションプールは、`http.Transport` で管理されます。
毎度生成するとコネクションプールが利用されず、都度接続することになります。

`http.Transport` はアプリケーション全体で1つ用意して使い回すことが推奨されています。(`http.Client` は複数作ってもいい)

### だめな例

こんなふうにリクエストごとに `Transport` を作ると、都度コネクションが確立されることになります。

```go
	for i := 0; i < 100; i++ {
    ...
			dt := http.DefaultTransport.(*http.Transport).Clone()
			dt.MaxIdleConnsPerHost = 100
			client := &http.Client{
				Transport: dt,
			}
			res, err := client.Do(req)
    ...
```

```shell
❯ go run ./
Attempt 7. conn reused=false, port=[::1]:61254
Attempt 2. conn reused=false, port=[::1]:61263
Attempt 3. conn reused=false, port=[::1]:61255
Attempt 6. conn reused=false, port=[::1]:61261
Attempt 4. conn reused=false, port=[::1]:61258
Attempt 5. conn reused=false, port=[::1]:61256
Attempt 9. conn reused=false, port=[::1]:61260
Attempt 1. conn reused=false, port=[::1]:61257
Attempt 8. conn reused=false, port=[::1]:61259
Attempt 10. conn reused=false, port=[::1]:61262
Attempt 11. conn reused=false, port=[::1]:61270
Attempt 19. conn reused=false, port=[::1]:61269
Attempt 15. conn reused=false, port=[::1]:61266
Attempt 17. conn reused=false, port=[::1]:61272
Attempt 18. conn reused=false, port=[::1]:61265
Attempt 14. conn reused=false, port=[::1]:61268
Attempt 20. conn reused=false, port=[::1]:61264
Attempt 13. conn reused=false, port=[::1]:61273
Attempt 12. conn reused=false, port=[::1]:61267
Attempt 16. conn reused=false, port=[::1]:61271
```

## `Transport` をカスタマイズしたい場合は `DefaultTransport` をCloneする

上記コードでは、`Transport` の設定を変更するのに以下のようにしていました。

```go
	dt := http.DefaultTransport.(*http.Transport).Clone()
	dt.MaxIdleConnsPerHost = 100
	client := &http.Client{
		Transport: dt,
	}
```

次のように書いてはだめなのでしょうか？

```go
	client := &http.Client{
		Transport: &http.Transport{
			MaxIdleConnsPerHost: 100,
		},
	}
```

`http.DefaultTransport` の定義を見ると以下のように、いい感じのデフォルト値があらかじめ設定されています。

```go
var DefaultTransport RoundTripper = &Transport{
	Proxy: ProxyFromEnvironment,
	DialContext: defaultTransportDialContext(&net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}),
	ForceAttemptHTTP2:     true,
	MaxIdleConns:          100,
	IdleConnTimeout:       90 * time.Second,
	TLSHandshakeTimeout:   10 * time.Second,
	ExpectContinueTimeout: 1 * time.Second,
}
```

これを無視して `&http.Transport{}` をセットすると、たとえばProxyを設定していないので、 `HTTPS_PROXY` 環境変数が利用されないなどの問題が発生します。

これを防ぐため、また将来的に新しいフィールドが追加された場合にも勝手に追従されるように `http.DefaultTransport.(*http.Transport).Clone()` とするのがいいでしょう。

## MaxIdleConnsPerHostを大きくする

先程まで、2回目以降のリクエスト時はコネクションがすべて再利用されました。
`http.DefaultClient` でリクエストする場合こうはなりません。

`http.DefaultClient` が通信時に参照する `http.DefaultTransport` の定義を見てみます。

`net/http/transport.go`

```go
// DefaultMaxIdleConnsPerHost is the default value of [Transport]'s
// MaxIdleConnsPerHost.
const DefaultMaxIdleConnsPerHost = 2
```

ここで関係するのは、`MaxIdleConns` と `MaxIdleConnsPerHost` の値です。
`MaxIdleConns` はTransport全体で保持できるコネクション数で、100が設定されています。
`MaxIdleConnsPerHost` はホストごとに保持できるコネクション数で、デフォルトは `DefaultMaxIdleConnsPerHost` で定義されているとおり2つまで保持するようになっています。

例えば同一のホストに10リクエスト送った場合、コネクションプールに残るのは2つのみとなります。再度10リクエストを送ると、2つのコネクションは再利用されますが残りの8リクエストは接続からやり直しになります。
これは接続先のIPアドレス単位ではなくFQDN単位で保持されます。
たいていのユースケースでは数を増やしたほうがいいと思います。

`MaxIdleConnsPerHost` の値を小さくして試験してみます。

```diff
-	dt.MaxIdleConnsPerHost = 10
+	dt.MaxIdleConnsPerHost = 2
```

```shell
❯ go run ./
Attempt 3. conn reused=false, port=[::1]:61774
Attempt 5. conn reused=false, port=[::1]:61781
Attempt 1. conn reused=false, port=[::1]:61777
Attempt 8. conn reused=false, port=[::1]:61776
Attempt 7. conn reused=false, port=[::1]:61780
Attempt 4. conn reused=false, port=[::1]:61775
Attempt 10. conn reused=false, port=[::1]:61779
Attempt 9. conn reused=false, port=[::1]:61772
Attempt 2. conn reused=false, port=[::1]:61773
Attempt 6. conn reused=false, port=[::1]:61778
Attempt 18. conn reused=true, port=[::1]:61785
Attempt 12. conn reused=true, port=[::1]:61783
Attempt 20. conn reused=false, port=[::1]:61784
Attempt 14. conn reused=true, port=[::1]:61775
Attempt 11. conn reused=true, port=[::1]:61774
Attempt 17. conn reused=true, port=[::1]:61778
Attempt 13. conn reused=true, port=[::1]:61780
Attempt 16. conn reused=true, port=[::1]:61773
Attempt 19. conn reused=true, port=[::1]:61789
Attempt 15. conn reused=true, port=[::1]:61772
Attempt 26. conn reused=true, port=[::1]:61772
Attempt 24. conn reused=true, port=[::1]:61773
Attempt 23. conn reused=true, port=[::1]:61775
Attempt 25. conn reused=true, port=[::1]:61789
Attempt 22. conn reused=true, port=[::1]:61787
Attempt 27. conn reused=true, port=[::1]:61792
Attempt 21. conn reused=true, port=[::1]:61786
Attempt 29. conn reused=true, port=[::1]:61795
Attempt 28. conn reused=false, port=[::1]:61796
Attempt 30. conn reused=false, port=[::1]:61791
Attempt 40. conn reused=false, port=[::1]:61797
Attempt 36. conn reused=true, port=[::1]:61787
Attempt 38. conn reused=true, port=[::1]:61796
Attempt 33. conn reused=true, port=[::1]:61794
Attempt 32. conn reused=true, port=[::1]:61793
Attempt 31. conn reused=true, port=[::1]:61789
Attempt 34. conn reused=true, port=[::1]:61792
Attempt 39. conn reused=true, port=[::1]:61791
Attempt 37. conn reused=true, port=[::1]:61795
Attempt 35. conn reused=true, port=[::1]:61786
...
```

2回目以降、コネクションが利用されている場合と、されずに接続している場合があることが見て取れます。

## タイムアウトを設定する

`http.DefaultClient` にはタイムアウト値が設定されていません。
サーバー側で切断しない限りはいつまでも待ち続けてしまい、そんなリクエストが大量に発生するとあっという間にリソースが枯渇します。

```go
	http.HandleFunc("GET /timeout", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(500 * time.Minute)

		w.Write([]byte("OK"))
	})
```

こんなハンドラーを用意して、DefaultClientでリクエストするとひたすら待ち続けます。

```go
func main() {

	req, _ := http.NewRequest("GET", "http://localhost:8080/timeout", nil)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	b, _ := io.ReadAll(res.Body)
	res.Body.Close()
	fmt.Println(string(b))

}
```

タイムアウト値はリクエスト送信処理の中の各ステップごとに設定できます。

- `net.Dialer.Timeout`: TCPコネクション確立にかかる時間
- `http.Transport.TLSHandshakeTimeout`: TLSハンドシェイクにかかる時間
- `http.Transport.ResponseHeaderTimeout`: Response headerを読み取る時間
- `http.Client.Timeout`: TCPコネクション確立 〜 Response body受けとり完了までの時間

最低限レスポンスを待ち続けないようにするために、`http.Client.Timeout` を設定しておくとよいでしょう。

```go
func main() {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	res, err := client.Get("http://localhost:8080/timeout")
	req, _ := http.NewRequest("GET", "http://localhost:8080/timeout", nil)
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	b, _ := io.ReadAll(res.Body)
	res.Body.Close()
	fmt.Println(string(b))
}
```

これで5秒で打ち切るようになります。

```shell
$ go run ./
panic: Get "http://localhost:8080/timeout": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
```

## おわりに

Goでhttp.Clientを使ってリクエストする際の諸注意事項をまとめました。
正しく使って十分なパフォーマンスが得られるように実装しましょう。

## 参考

- [Goのnet/httpのkeep-aliveで気をつけること - Carpe Diem](https://christina04.hatenablog.com/entry/go-keep-alive)
- [本番環境でデフォルトの HTTP Client を使ってはいけない理由について](https://belonginc.dev/members/mohiro/posts/http-default-client)
- [Goのnet/httpのclientでなぜresponseBodyをClose、読み切らなくてはいけないのか](https://zenn.dev/cube/articles/4ce18a672fc991)
- [Connection re-use in Golang with http.Client - stuartleeks.com](https://stuartleeks.com/posts/connection-re-use-in-golang-with-http-client/)
- [[Go] 前方互換性を保ちながらhttp.DefaultTransportからチューニングしたhttp.Transportをつくる - My External Storage](https://budougumi0617.github.io/2021/09/13/how_to_copy_default_transport/)
