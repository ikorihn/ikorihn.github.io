---
title: Go http.ClientのConnection設定値について調査
date: "2022-12-20T18:17:00+09:00"
tags:
  - 'Go'
lastmod: "2022-12-20T18:17:00+09:00"
---

#Go


[Go言語: http.Client のコネクション管理 (HTTP/1.x) - Qiita](https://qiita.com/nozmiz/items/b4e8a48c75bf01ccc9f0)
[[Go] 前方互換性を保ちながらhttp.DefaultTransportからチューニングしたhttp.Transportをつくる - My External Storage](https://budougumi0617.github.io/2021/09/13/how_to_copy_default_transport/)

`http.Client` の `Transport` にコネクションプール関連のパラメータが設定できる。

- `MaxIdleConns` Transport 全体で保持できる空きコネクション総数。デフォルトは100
- `MaxIdleConnsPerHost` 接続先ごとに保持できる空きコネクション総数。デフォルトは2
- `MaxConnsPerHost` 接続先ごとのコネクション総数(使用中・空き・接続中のものを含む)。デフォルトは0(無制限)
- `IdleConnTimeout` 空きコネクションを保持できる最長時間。デフォルトは90秒

## 調査用コード

```go
package main

import (
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptrace"
	"sync	"time"
)

var urls = []string{
	"http://httpbin.org/delay/1",
	"http://httpbin.org/delay/2",
	"http://httpbin.org/delay/3",
	"http://example.com",
}

var client *http.Client

func main() {
	tr := http.DefaultTransport.(*http.Transport).Clone()
    // コネクションプール関連のパラメータを設定する
	// tr.MaxIdleConns = 10
	// tr.MaxIdleConnsPerHost = 2
	// tr.MaxConnsPerHost = 10
	// tr.IdleConnTimeout = 10 * time.Second
	client = &http.Client{
		Transport: tr,
	}

	fmt.Printf("--- send start ---- MaxConnsPerHost: %v, MaxIdleConns: %v, MaxIdleConnsPerHost: %v, IdleConnTimeout: %v\n",
		tr.MaxConnsPerHost,
		tr.MaxIdleConns,
		tr.MaxIdleConnsPerHost,
		tr.IdleConnTimeout,
	)
	start := time.Now()
	asyncSend()
	fmt.Println("--- sleep 3s...")
	time.Sleep(3 * time.Second)
	asyncSend()

	fmt.Printf("elapsed: %v\n", time.Since(start))

}

func asyncSend() {
	var wg sync.WaitGroup
	for _, url := range urls {
		url := url

		wg.Add(1)
		go func() {
			defer wg.Done()
			send(url)
		}()
	}
	wg.Wait()
}

func send(url string) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal(err)
	}

	var connStart time.Time
	var connDuration time.Duration
	var conninfo httptrace.GotConnInfo
	trace := &httptrace.ClientTrace{
		GotConn: func(connInfo httptrace.GotConnInfo) {
			conninfo = connInfo
		},
		ConnectStart: func(network, addr string) {
			connStart = time.Now()
		},
		ConnectDone: func(network, addr string, err error) {
			connDuration = time.Since(connStart)
		},
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))

	var resp *http.Response
	resp, err = client.Do(req)
	if err != nil {
		log.Fatalf("client.Do %v\n", err)
	}
	defer resp.Body.Close()

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Fprintf(io.Discard, "res: %s", string(b))

	log.Printf("GET %s: Proto %s, TCPConnection %v, ConnectionInfo %+v\n", url, resp.Proto, connDuration, conninfo)
}
```

### `net/http/httptrace` を使う

Go 1.7 から入ったhttptraceパッケージで、`http events` をトレースすることができる

-   Connection creation
-   Connection reuse
-   DNS lookups
-   Writing the request to the wire
-   Reading the response

`httptrace.ClientTrace` で、各フェーズにfuncを設定することでログを仕込んだり時間を計測したりできる

```go
	var connStart time.Time
	var connDuration time.Duration
	trace := &httptrace.ClientTrace{
		TLSHandshakeDone: func(cs tls.ConnectionState, err error) {
			log.Printf("TLSHandshake Done: %+v\n", cs)
		},
		GetConn: func(hostPort string) {
			log.Printf("Get Conn: %v\n", hostPort)
		},
		GotConn: func(connInfo httptrace.GotConnInfo) {
			log.Printf("Got Conn: %+v\n", connInfo)
		},
		DNSDone: func(dnsInfo httptrace.DNSDoneInfo) {
			log.Printf("DNS Info: %+v\n", dnsInfo)
		},
		ConnectStart: func(network, addr string) {
			connStart = time.Now()
		},
		ConnectDone: func(network, addr string, err error) {
			connDuration = time.Since(connStart)
			log.Printf("Connect Done: %v\n", connDuration)
		},
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))

```

## 結果

設定値をいろいろ変えながら実行してみる

### デフォルト

同一ホストに対して2つのコネクションは再利用された

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 100, MaxIdleConnsPerHost: 0, IdleConnTimeout: 1m30s
2022/12/20 18:58:25 GET http://example.com: Proto HTTP/1.1, TCPConnection 21.032458ms, ConnectionInfo {Conn:0x14000010048 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 18:58:27 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 33.830875ms, ConnectionInfo {Conn:0x14000218028 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 18:58:28 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 33.052625ms, ConnectionInfo {Conn:0x14000010050 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 18:58:28 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 32.912542ms, ConnectionInfo {Conn:0x1400019e020 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 18:58:31 GET http://example.com: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010048 Reused:true WasIdle:true IdleTime:6.437538416s}
2022/12/20 18:58:33 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000218028 Reused:true WasIdle:true IdleTime:3.80156475s}
2022/12/20 18:58:34 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 10.771792ms, ConnectionInfo {Conn:0x14000010068 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 18:58:35 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010050 Reused:true WasIdle:true IdleTime:3.087510208s}
elapsed: 10.291201167s
```

### MaxIdleConns=1

全体で保持できるIdle中のコネクション数を1にする
=> 全体で1つだけ再利用された

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 1, MaxIdleConnsPerHost: 0, IdleConnTimeout: 1m30s
2022/12/20 19:01:56 GET http://example.com: Proto HTTP/1.1, TCPConnection 19.573917ms, ConnectionInfo {Conn:0x14000220018 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:01:58 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 38.706084ms, ConnectionInfo {Conn:0x14000010038 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:01:59 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 38.803583ms, ConnectionInfo {Conn:0x14000120020 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:02:00 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 39.267958ms, ConnectionInfo {Conn:0x14000010040 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:02:03 GET http://example.com: Proto HTTP/1.1, TCPConnection 20.372584ms, ConnectionInfo {Conn:0x14000308048 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:02:05 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 22.206166ms, ConnectionInfo {Conn:0x14000220058 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:02:05 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010040 Reused:true WasIdle:true IdleTime:3.001381s}
2022/12/20 19:02:06 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 20.229334ms, ConnectionInfo {Conn:0x14000120038 Reused:false WasIdle:false IdleTime:0s}
elapsed: 10.021672791s
```

### MaxIdleConnsPerHost=1

接続先ごとに保持できるIdle中のコネクション数を1にする
=> 接続先ごとに1つずつ再利用された

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 100, MaxIdleConnsPerHost: 1, IdleConnTimeout: 1m30s
2022/12/20 19:03:05 GET http://example.com: Proto HTTP/1.1, TCPConnection 19.162375ms, ConnectionInfo {Conn:0x1400012c048 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:06 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 23.317375ms, ConnectionInfo {Conn:0x14000010038 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:08 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 23.148917ms, ConnectionInfo {Conn:0x14000010030 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:09 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 25.611208ms, ConnectionInfo {Conn:0x14000010040 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:03:12 GET http://example.com: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x1400012c048 Reused:true WasIdle:true IdleTime:6.369719167s}
2022/12/20 19:03:13 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 22.194541ms, ConnectionInfo {Conn:0x1400009e058 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:15 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010038 Reused:true WasIdle:true IdleTime:5.231218708s}
2022/12/20 19:03:15 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 16.294916ms, ConnectionInfo {Conn:0x1400009e050 Reused:false WasIdle:false IdleTime:0s}
elapsed: 10.556359875s
```

### MaxIdleConnsPerHost=3

接続先ごとに保持できるIdle中のコネクション数を3にする
=> 接続先ごとに3つずつ再利用された

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 100, MaxIdleConnsPerHost: 3, IdleConnTimeout: 1m30s
2022/12/20 19:03:35 GET http://example.com: Proto HTTP/1.1, TCPConnection 22.971458ms, ConnectionInfo {Conn:0x14000010028 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:37 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 24.629334ms, ConnectionInfo {Conn:0x1400032c010 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:38 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 22.705208ms, ConnectionInfo {Conn:0x14000010030 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:03:39 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 22.523167ms, ConnectionInfo {Conn:0x1400032c008 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:03:43 GET http://example.com: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010028 Reused:true WasIdle:true IdleTime:7.025793875s}
2022/12/20 19:03:44 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000010030 Reused:true WasIdle:true IdleTime:4.847397167s}
2022/12/20 19:03:45 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x1400032c008 Reused:true WasIdle:true IdleTime:3.001350125s}
2022/12/20 19:03:46 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x1400032c010 Reused:true WasIdle:true IdleTime:5.766263584s}
elapsed: 10.564832208s
```

### MaxConnsPerHost=1

接続先ごとのコネクション数を1にする
=> 接続先ごとに一つだけコネクションが作成され、それが再利用された

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 1, MaxIdleConns: 100, MaxIdleConnsPerHost: 0, IdleConnTimeout: 1m30s
2022/12/20 19:03:59 GET http://example.com: Proto HTTP/1.1, TCPConnection 10.686958ms, ConnectionInfo {Conn:0x140000aa050 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:04:01 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 15.183792ms, ConnectionInfo {Conn:0x14000120030 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:04:03 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000120030 Reused:true WasIdle:false IdleTime:0s}
2022/12/20 19:04:06 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000120030 Reused:true WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:04:09 GET http://example.com: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x140000aa050 Reused:true WasIdle:true IdleTime:10.279613416s}
2022/12/20 19:04:13 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000120030 Reused:true WasIdle:true IdleTime:3.001459625s}
2022/12/20 19:04:14 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000120030 Reused:true WasIdle:false IdleTime:0s
2022/12/20 19:04:18 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000120030 Reused:true WasIdle:false IdleTime:0s}
elapsed: 19.207177666s
```

### IdleConnTimeout=2s

コネクションがIdleで待機できる時間を2秒にする
=> 2秒経過でコネクションが切断され、再利用されなかった

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 100, MaxIdleConnsPerHost: 0, IdleConnTimeout: 2s
2022/12/20 19:04:56 GET http://example.com: Proto HTTP/1.1, TCPConnection 18.289333ms, ConnectionInfo {Conn:0x14000218030 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:04:58 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 35.073625ms, ConnectionInfo {Conn:0x14000306000 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:04:59 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 35.495083ms, ConnectionInfo {Conn:0x1400012c058 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:00 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 34.939209ms, ConnectionInfo {Conn:0x1400012c050 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:05:03 GET http://example.com: Proto HTTP/1.1, TCPConnection 26.906709ms, ConnectionInfo {Conn:0x14000306038 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:04 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 33.716209ms, ConnectionInfo {Conn:0x1400012c088 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:06 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 27.599459ms, ConnectionInfo {Conn:0x14000010050 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:07 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 26.6985ms, ConnectionInfo {Conn:0x1400012c080 Reused:false WasIdle:false IdleTime:0s}
elapsed: 10.808737583s
```

### MaxIdleConns < MaxIdleConnsPerHost

全体のIdleコネクション数を、接続先ごとのIdleコネクション数より少なくする
=> 全体のIdleコネクション数が上限となる

```
$ go run *.go
--- send start ---- MaxConnsPerHost: 0, MaxIdleConns: 2, MaxIdleConnsPerHost: 3, IdleConnTimeout: 1m30s
2022/12/20 19:05:33 GET http://example.com: Proto HTTP/1.1, TCPConnection 9.587334ms, ConnectionInfo {Conn:0x14000010040 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:35 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 33.300458ms, ConnectionInfo {Conn:0x1400012c038 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:37 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 33.856917ms, ConnectionInfo {Conn:0x14000218020 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:37 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 33.399125ms, ConnectionInfo {Conn:0x14000218018 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/20 19:05:40 GET http://example.com: Proto HTTP/1.1, TCPConnection 18.400042ms, ConnectionInfo {Conn:0x1400012c050 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:41 GET http://httpbin.org/delay/1: Proto HTTP/1.1, TCPConnection 21.112875ms, ConnectionInfo {Conn:0x1400012c058 Reused:false WasIdle:false IdleTime:0s}
2022/12/20 19:05:42 GET http://httpbin.org/delay/2: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000218018 Reused:true WasIdle:true IdleTime:3.001382958s}
2022/12/20 19:05:43 GET http://httpbin.org/delay/3: Proto HTTP/1.1, TCPConnection 0s, ConnectionInfo {Conn:0x14000218020 Reused:true WasIdle:true IdleTime:3.001510458s}
elapsed: 9.904582917s
```


| MaxConnsPerHost | MaxIdleConns | MaxIdleConnsPerHost | IdleConnTimeout | コネクション                                                   |
| ----            | ----         | ----                | ----            | ----                                                           |
| 0               | 100          | 2                   | 1m30s           | 接続先ごとに2つまで再利用された                                |
| 0               | 1            | 2                   | 1m30s           | 全体で1つだけ再利用された                                      |
| 0               | 100          | 1                   | 1m30s           | 接続先ごとに1つずつ再利用された                                |
| 0               | 100          | 3                   | 1m30s           | 接続先ごとに3つずつ再利用された                                |
| 1               | 100          | 2                   | 1m30s           | 接続先ごとに一つだけコネクションが作成され、それが再利用された |
| 0               | 100          | 2                   | 2s              | 2秒経過でコネクションが切断され、再利用されなかった            |
| 0               | 2            | 3                   | 1m30s           | MaxIdleConnsが上限となる                                       |


### HTTP/2.0 の場合

接続先がHTTP/2.0の場合、MaxConnsPerHost=1 にしても一つのコネクションで同時に複数リクエストを処理することができる。

https://knowledge.sakura.ad.jp/7734/
あまり詳しくないのだが、ストリームによって1つのコネクション内で同時に並行して複数のリクエスト/レスポンスを処理できるということだろうか

```
--- send start ---- MaxConnsPerHost: 1, MaxIdleConns: 100, MaxIdleConnsPerHost: 0, IdleConnTimeout: 1m30s
2022/12/21 10:50:15 GET https://example.com: Proto HTTP/2.0, TCPConnection 117.219375ms, ConnectionInfo {Conn:0x1400030a000 Reused:false WasIdle:false IdleTime:0s}
2022/12/21 10:50:16 GET https://httpbin.org/delay/1: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a380 Reused:true WasIdle:false IdleTime:0s}
2022/12/21 10:50:17 GET https://httpbin.org/delay/2: Proto HTTP/2.0, TCPConnection 171.794125ms, ConnectionInfo {Conn:0x1400030a380 Reused:true WasIdle:false IdleTime:0s}
2022/12/21 10:50:18 GET https://httpbin.org/delay/3: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a380 Reused:false WasIdle:false IdleTime:0s}
--- sleep 3s...
2022/12/21 10:50:22 GET https://example.com: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a000 Reused:true WasIdle:true IdleTime:6.22757825s}
2022/12/21 10:50:23 GET https://httpbin.org/delay/1: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a380 Reused:true WasIdle:true IdleTime:3.001377041s}
2022/12/21 10:50:24 GET https://httpbin.org/delay/2: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a380 Reused:true WasIdle:false IdleTime:0s}
2022/12/21 10:50:25 GET https://httpbin.org/delay/3: Proto HTTP/2.0, TCPConnection 0s, ConnectionInfo {Conn:0x1400030a380 Reused:true WasIdle:true IdleTime:3.001423166s}
elapsed: 9.895872041s
```
