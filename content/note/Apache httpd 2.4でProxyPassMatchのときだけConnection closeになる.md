---
title: Apache httpd 2.4でProxyPassMatchのときだけConnection closeになる
date: 2024-04-08T11:17:00+09:00
---

リバースプロキシとして [[Apache httpd]] を立てて別のサーバにhttpでプロキシしているときに、upstreamに対するコネクションをKeep-Aliveしたかったのだが、よくわからない事象に遭遇して1日はまった。

## 発生した事象

- `ProxyPass` を使う => `Connection: Keep-Alive` ヘッダーがつき期待通りkeep-aliveされる
- `ProxyPassMatch` を使って正規表現でマッピングする => `Connection: close` ヘッダーがつきkeep-aliveされない

## 再現

### compose.yaml
```yaml:title=compose.yaml
services:
  httpd:
    build:
      context: .
    ports:
      - 80:80
  app:
    build:
      context: ./app
    expose:
      - 1323
```

### httpdの設定

```dockerfile
FROM public.ecr.aws/docker/library/httpd:2.4
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf
```

`my-httpd.conf`

```conf
LoadModule mpm_event_module modules/mod_mpm_event.so
Listen 80
LoadModule unixd_module modules/mod_unixd.so
LoadModule authz_core_module modules/mod_authz_core.so

# enable proxy
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

ProxyPassMatch "^/app/users/([0-9]{4})$" "http://app:1323/users/$1"
```

起動とProxyに必要な最小限の設定をいれている

### appコンテナの設定

```go:title=app/main.go
package main

import (
	"fmt"
	"net/http"
	"strings"
)

func main() {
	http.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {

		headers := []string{}
		for k := range r.Header {
			headers = append(headers, fmt.Sprintf("%s:%s", k, r.Header.Get(k)))
		}
		fmt.Printf("Headers: %s\n", strings.Join(headers, ", "))
		fmt.Printf("Id: %s\n", r.PathValue("id"))
	})
	if err := http.ListenAndServe(":1323", nil); err != nil {
		panic(err)
	}
}
```

```dockerfile
FROM public.ecr.aws/docker/library/golang:1.22  as build-env

COPY main.go main.go
COPY go.mod .
RUN CGO_ENABLED=0 GOOS=linux go build -o /go/bin/app

FROM public.ecr.aws/docker/library/alpine:3.19

COPY --from=build-env /go/bin/app /app
CMD ["/app"]
```

### 起動 & リクエスト

```shell
$ docker compose up --build

$ curl 'http://localhost/app/users/1234'

Headers: X-Forwarded-Server:172.26.0.2, Connection:close, User-Agent:curl/8.4.0, Accept:*/*, X-Forwarded-For:172.26.0.1, X-Forwarded-Host:localhost
Id: 1234
```

=> `Connection:close` ヘッダーが送られている。

## 答え

https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypassmatch

`enablereuse=on` をつける、と書いてあった。日本語版ドキュメントにはまだ記載がない。


> Since Apache HTTP Server 2.4.47, the `key=value` Parameters are no longer ignored in a `ProxyPassMatch` using an url with backreference(s). However to keep the existing behavior regarding reuse/keepalive of backend connections (which were never reused before for these URLs), the parameter enablereuse (or disablereuse) default to `off` (resp. `on`) in this case. Setting `enablereuse=on` explicitely allows to reuse connections **unless** some backreference(s) belong in the `authority` part (hostname and/or port) of the url (this condition is enforced since Apache HTTP Server 2.4.55, and produces a warning at startup because these URLs are not reusable per se).

とあり、2.4.47以降は正規表現の後方参照を使う場合でも `key=value` パラメータを適用できるようになっている。
後方互換性のため、デフォルトではkeep-aliveに関してはoffになっているので、 `enablereuse=on` または `disablereuse=off` を明示する必要がある。
ただし後方参照によってauthority(hostnameやport)を書き換えようとするときには適用されない。

実際に試してみた。
```diff
-ProxyPassMatch /app/users/([0-9]{4}) /app/v2/users/$1
+ProxyPassMatch /app/users/([0-9]{4}) /app/v2/users/$1 enableuse=on
```

confを上記のように変更して再起動して再度リクエストすると、期待通りKeep-Aliveとなった

```shell
$ curl 'http://localhost/app/users/1234'

Headers: Connection:Keep-Alive, User-Agent:curl/8.4.0, Accept:*/*, X-Forwarded-For:172.26.0.1, X-Forwarded-Host:localhost, X-Forwarded-Server:172.26.0.2
Id: 1234
```

これにたどり着くまでにいくつか試したので記録する。

## 試したこと

### KeepAlive On

https://httpd.apache.org/docs/2.4/mod/core.html#keepalive

`KeepAlive` Directive をOnにするとどうかと思ったが、これは **httpdに接続するクライアントとの通信をKeepAliveするため** のものなので、upstreamとの通信には関係がない。

### keepalive=on

[ProxyPassのパラメータ](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypass) に`keepalive=on` というのがあり、これに違いないとセットしてみたが関係無かった

```
ProxyPassMatch /app/users/([0-9]{4}) /app/v2/users/$1 keepalive=on
```

> This parameter should be used when you have a firewall between your Apache httpd and the backend server, which tends to drop inactive connections. This flag will tell the Operating System to send `KEEP_ALIVE` messages on inactive connections and thus prevent the firewall from dropping the connection. To enable keepalive, set this property value to `On`.

とあり、firewallを間に挟んでいてそれがin-activeなコネクションを切断するようなときに、切断されないように**OSがTCPレベルでKEEP_ALIVEを送信するためのパラメータ** であって、HTTPのKeepAliveとは関係なさそう

### SetEnv proxy-nokeepalive

upstreamとHTTP 1.0で通信したいときに、keep-aliveをOffにするパラメータがある

https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#envsettings
```
SetEnv force-proxy-request-1.0 1
SetEnv proxy-nokeepalive 1
```

じゃあ逆にkeepaliveを強制できないかなと、やけくそで適当にセットしてみたがもちろんこんなパラメータはないので効かなかった
```
SetEnv proxy-keepalive 1
```

