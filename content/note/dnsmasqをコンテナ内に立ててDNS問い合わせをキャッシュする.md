---
title: dnsmasqをコンテナ内に立ててDNS問い合わせをキャッシュする
date: 2022-12-07T12:37:00+09:00
tags:
- Docker
- Network
---

[dnsmasq](https://wiki.archlinux.jp/index.php/Dnsmasq) は小規模なネットワーク向けのDNS、DHCPサーバー。
DNSのキャッシュくらい、デフォルトであるものだと思っていたけどLinuxはそうではないようなので、こういうソフトウェアを入れてキャッシュさせる

yum でインストールして、設定ファイルを書き換える

dnsmasqをインストールすると、 `/etc/dnsmasq.conf` という設定ファイルが生成されるので、コメントアウトを外す
とりあえず以下を設定する

````
domain-needed #ドメインの無いホスト名のみ問い合わせの場合、上位DNSサーバに転送しない
bogus-priv #プライベートIPアドレスの逆引きを上位DNSサーバに転送しない
resolv-file #上位DNSサーバの設定
````

````Dockerfile
FROM amazonlinux:2

RUN yum install -y dnsmasq systemd

RUN echo 'nameserver 8.8.8.8' > /etc/dnsmasq_resolv.conf \
  && sed -i -e 's/#domain-needed/domain-needed/' -e 's/#bogus-priv/bogus-priv/' -e 's@#resolv-file=@resolv-file=/etc/dnsmasq_resolv.conf@' /etc/dnsmasq.conf \
  && systemctl enable dnsmasq

ENTRYPOINT ["/sbin/init"]
````

実行時は `--privileged` と、 `--dns=127.0.0.1` で `/etc/resolv.conf` に `nameserver 127.0.0.1` が書かれるようにする

````shell
$ docker build -t dnsmasq-test .
$ docker run --privileged -it --dns=127.0.0.1 --name=dnsmasq dnsmasq-test
````

````shell
# digをインストール
$ yum install -y bind-utils
$ dig https://httpbin.org

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.amzn2.5.2 <<>> https://httpbin.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 59931
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;https://httpbin.org.           IN      A

;; AUTHORITY SECTION:
org.                    1800    IN      SOA     a0.org.afilias-nst.info. hostmaster.donuts.email. 1670768991 7200 900 1209600 3600

;; Query time: 18 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Sun Dec 11 14:39:32 UTC 2022
;; MSG SIZE  rcvd: 130

````
