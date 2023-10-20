---
title: Squidで多段proxyを構成する
date: 2022-12-12T18:45:00+09:00
tags: null
---

dockerコンテナ内からproxyを経由して接続したい場合、 `HTTP_PROXY` や `HTTPS_PROXY` を設定すると思う。
これはコンテナ内からproxyサーバーに疎通できるときは問題ない。
EAA Clientの挙動を見ると、どうもローカルにProxyサーバーを立てているみたい。
host.docker.internalでもアクセスできない場所にいる。
ほかにも認証付きProxyを経由したいときに認証をパスするときにも使えそう。

[Mac OSXでSquidを導入して認証付Proxyを突破させる – SWK623](https://swk623.com/2016/09/05/mac-osx%E3%81%A7squid%E3%82%92%E5%B0%8E%E5%85%A5%E3%81%97%E3%81%A6%E8%AA%8D%E8%A8%BC%E4%BB%98proxy%E3%82%92%E7%AA%81%E7%A0%B4%E3%81%95%E3%81%9B%E3%82%8B/)
[Squidで多段プロキシ設定 - ITの窓辺から](https://realizeznsg.hatenablog.com/entry/2018/08/01/070000)

## 環境

* M1 Macbook

1. ホストマシンにプロキシサーバーを立てる(ここではsquidをbrewでインストール `brew install squid`)
1. `/opt/homebrew/etc/squid.conf` を変更

````
#
# INSERT YOUR OWN RULE(S) HERE TO ALLOW ACCESS FROM YOUR CLIENTS
#
cache_peer <接続先プロキシサーバーのIPアドレス> parent <接続先プロキシサーバーのポート番号> 0 no-query
never_direct allow all
visible_hostname unknown

...
# Squid normally listens to port 3128
http_port 3129
````

3. squidをスタート `brew services run squid`  
   4. `/opt/homebrew/var/logs/cache.log` を見て起動したことを確認
   5. `docker run` で適当なコンテナに入った後、proxy経由でないと接続できないホストにアクセスできることを確認

````shell
$ curl -x http://host.docker.internal:3129 <リソース>
=> 接続できることを確認
````
