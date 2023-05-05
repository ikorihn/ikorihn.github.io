---
title: Termux SSHセットアップ
date: 2021-05-03T15:26:00+09:00
tags:
- terminal
- Android
---

[Termux](note/Termux.md) をPCから操作できるようにするため、sshサーバーを起動して接続する

### 参考

* [Termuxを素早く設定 - Qiita](https://qiita.com/kujirahand/items/8e34e05e7296134b55cd)

````sh
pkg install openssh
````

### PCでSSH鍵ペアを作成

````sh
ssh-keygen -t rsa
````

### 公開鍵を転送

PCで作成した公開鍵をGoogle Keepなど使ってAndroidに転送

````sh
cat ~/.ssh/id_rsa.pub | pbcopy
````

Termux

````sh
$ vim ~/.ssh/authorized_keys
=> 公開鍵貼り付け
````

### sshd起動

Termuxでsshdを起動

````sh
sshd
````

### 接続

IPアドレスを確認

````sh
$ ip -4 a

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
30: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 3000
    inet 192.168.10.109/24 brd 192.168.10.255 scope global wlan0
       valid_lft forever preferred_lft forever
````

192.169.10.109がAndroidのIPアドレスとなる。
PCからはこのIPで接続できる。
1024以下のポートが使用できないため、8022番になっている

````sh
ssh -p 8022 192.169.10.109
````
