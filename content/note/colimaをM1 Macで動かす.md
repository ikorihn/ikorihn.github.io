---
title: colimaをM1 Macで動かす
date: 2024-02-01T17:52:00+09:00
tags:
  - Docker
---

{{< card-link "https://github.com/abiosoft/colima" >}}

最小限の設定だけでmacOSやLinuxで動くcontainer runtime。
VMはlimaを使っている。

## port mappingを有効にするには

macOSではデフォルトで、VMに到達可能なIPアドレスが振られないようになっている。
このとき、 `docker run -p 80:80` などとしてもportがマッピングされないのでホストからコンテナ内のアプリケーションに接続できない。

この設定を有効にするとマッピングされるようになる。
ただしルート権限が必要で、colimaの起動も遅くなる。

https://github.com/abiosoft/colima/blob/main/docs/FAQ.md#enable-reachable-ip-address

設定ファイル `~/.colima/default/colima.yaml` に `network.address=true` を記載する。

```diff
network:
-  address: false
+  address: true
```

## コンテナ内からhostにアクセスするには

Docker Desktopでは `host.docker.internal` のFQDNでコンテナ内部からホストにアクセスできる。
colimaの場合、デフォルトではこのFQDNではなく `host.lima.internal` を使用する。

`host.docker.internal` を使いたい場合は、設定ファイルでリゾルブ先を指定すればよい

```yaml
network:
  dnsHosts:
    host.docker.internal: host.lima.internal
```