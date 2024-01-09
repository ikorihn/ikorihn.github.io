---
title: Go TCP接続とDNS問い合わせの頻度、それによる実行時間の違いを調査
date: 2023-12-08T15:18:00+09:00
tags:
- Go
---

[Go http.ClientのConnection設定値について調査](note/Go%20http.ClientのConnection設定値について調査.md) も参照

## 調査

調査用コード

https://github.com/tcnksm/go-httpstat を使用する

````go
package main

import (
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/tcnksm/go-httpstat"
)

var (
	urls = []string{
		"https://httpbin.org/delay/5",
		"https://httpbin.org/get?name=foo",
	}
)

func main() {
	tr := http.DefaultTransport.(*http.Transport).Clone()
	// tr.IdleConnTimeout = 2 * time.Second
	client := &http.Client{
		Transport: tr,
		Timeout:   30 * time.Second,
	}

	for _, url := range urls {
		log.Printf("GET %s", url)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatal(err)
		}
		result := new(httpstat.Result)
		ctx := httpstat.WithHTTPStat(req.Context(), result)
		req = req.WithContext(ctx)

		resp, err := client.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		io.Copy(ioutil.Discard, resp.Body)
		resp.Body.Close()

		result.End(time.Now())
		log.Printf("result\n%+v\n", result)

		time.Sleep(5 * time.Second)
	}
}
````

````
2022/12/19 12:56:00 GET https://httpbin.org/delay/5
2022/12/19 12:56:06 result
DNS lookup:          28 ms
TCP connection:     159 ms
TLS handshake:      342 ms
Server processing: 5179 ms
Content transfer:     0 ms

Name Lookup:      28 ms
Connect:         187 ms
Pre Transfer:    530 ms
Start Transfer: 5710 ms
Total:          5710 ms

2022/12/19 12:56:11 GET https://httpbin.org/get?name=foo
2022/12/19 12:56:11 result
DNS lookup:           0 ms
TCP connection:       0 ms
TLS handshake:        0 ms
Server processing:  168 ms
Content transfer:     0 ms

Name Lookup:       0 ms
Connect:           0 ms
Pre Transfer:      0 ms
Start Transfer:  168 ms
Total:           168 ms
````

**=> keep-aliveされていて、DNS問い合わせも行われない**

### keep-aliveの時間を短くする

`tr.IdleConnTimeout` のコメントアウトを外して、2秒でkeep-aliveが切れるように設定する

````
2022/12/19 12:51:56 GET https://httpbin.org/delay/5
2022/12/19 12:52:02 result
DNS lookup:          41 ms
TCP connection:     180 ms
TLS handshake:      351 ms
Server processing: 5270 ms
Content transfer:     0 ms

Name Lookup:      41 ms
Connect:         221 ms
Pre Transfer:    573 ms
Start Transfer: 5844 ms
Total:          5844 ms

2022/12/19 12:52:07 GET https://httpbin.org/get?name=foo
2022/12/19 12:52:07 result
DNS lookup:           1 ms
TCP connection:     188 ms
TLS handshake:      349 ms
Server processing:  178 ms
Content transfer:     0 ms

Name Lookup:       1 ms
Connect:         190 ms
Pre Transfer:    540 ms
Start Transfer:  718 ms
Total:           719 ms
````

**=> 設定した時間でコネクションが切断されて、再度DNS lookupとTCP connectionが実行されている**

再接続の都度DNS問い合わせを行っていることがわかる

Macで実行したため、OSでキャッシュされているのか2回目の問い合わせは時間が短い

### 対策

* keep-aliveの時間を適切に設定する
* DNS問い合わせ結果をキャッシュする

## DNS問い合わせ結果をキャッシュする

### アプリケーション内でキャッシュする

https://github.com/mercari/go-dnscache などのライブラリを使う

### dnsmasqを使ってローカルにDNS問い合わせ結果をキャッシュする

dnsmasq は小規模なネットワーク向けのDNS、DHCPサーバー。  
LinuxはデフォルトではDNSをキャッシュしないので、こういうソフトウェアを入れてキャッシュさせる

yum でインストールして、設定ファイルを書き換える

dnsmasqをインストールすると、 `/etc/dnsmasq.conf` という設定ファイルが生成されるので、コメントアウトを外す  
とりあえず以下を設定する

````
domain-needed #ドメインの無いホスト名のみ問い合わせの場合、上位DNSサーバに転送しない
bogus-priv #プライベートIPアドレスの逆引きを上位DNSサーバに転送しない
resolv-file #上位DNSサーバの設定
````

````Dockerfile
# ビルド用
FROM golang:latest as build-env

WORKDIR /workdir

COPY go.mod go.sum ./
RUN go mod download

COPY ./ ./

RUN CGO_ENABLED=0 go build -o /bin/server ./

# 実行環境
FROM amazonlinux:2

RUN yum install -y dnsmasq systemd

RUN echo 'nameserver 8.8.8.8' > /etc/dnsmasq_resolv.conf \
  && sed -i -e 's/#domain-needed/domain-needed/' -e 's/#bogus-priv/bogus-priv/' -e 's@#resolv-file=@resolv-file=/etc/dnsmasq_resolv.conf@' /etc/dnsmasq.conf \
  && systemctl enable dnsmasq \
  && echo 'nameserver 127.0.0.1' > /etc/resolv.conf

COPY --from=build-env /bin/server /server
COPY conf conf

EXPOSE 1323
ENTRYPOINT ["/sbin/init"]
````

実行時は `--privileged` と、 `--dns=127.0.0.1` で `/etc/resolv.conf` に `nameserver 127.0.0.1` が書かれるようにする

````
$ docker build -t dnsmasq-test .
$ docker run --privileged --dns=127.0.0.1 --name=dnsmasq-test dnsmasq-test
````

別のターミナルからexecでログインして実行

````shell
$ docker exec -it dnsmasq-test bash

bash-4.2# ./main
2022/12/19 04:09:14 GET https://httpbin.org/delay/5
2022/12/19 04:09:20 result
DNS lookup:          22 ms
TCP connection:     161 ms
TLS handshake:      350 ms
Server processing: 5186 ms
Content transfer:     0 ms

Name Lookup:      22 ms
Connect:         183 ms
Pre Transfer:    534 ms
Start Transfer: 5721 ms
Total:          5721 ms

bash-4.2# ./main
2022/12/19 04:09:34 GET https://httpbin.org/delay/5
2022/12/19 04:09:40 result
DNS lookup:           1 ms
TCP connection:     161 ms
TLS handshake:      344 ms
Server processing: 5337 ms
Content transfer:     0 ms

Name Lookup:       1 ms
Connect:         162 ms
Pre Transfer:    507 ms
Start Transfer: 5844 ms
Total:          5845 ms
````

**=> 2回目の実行時はDNS問い合わせ時間が短くなっている**

## 参考

[Re:golang の http.Client を速くする](https://shogo82148.github.io/blog/2017/01/14/re-golang-dns-cache/)
