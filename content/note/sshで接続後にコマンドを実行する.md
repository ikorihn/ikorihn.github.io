---
title: sshで接続後にコマンドを実行する
date: 2021-10-25T13:36:00+09:00
tags:
- shell
- terminal
lastmod: 2021-10-25T13:36:46+09:00
---

踏み台サーバーにログインしたあと、毎回専用ユーザーになるのが面倒だったので調べた

### ログイン後別のユーザーになりたい

````.ssh/config
Host bastion_aws
  HostName x.x.x.x
  RemoteCommand su - user2
  RequestTTY force
````

### ログイン後所定のディレクトリに移動したい

````.ssh/config
Host bastion
  HostName x.x.x.x
  RemoteCommand cd temp; bash
  RequestTTY force
````

末尾のbashがないと、コマンド実行後すぐに切断される

### sshコマンドオプションでも可能

````bash
ssh -t user1@remote.host "sudo su - user2" 
````

`-t` でtty割り当て

## 解説

<https://man7.org/linux/man-pages/man5/ssh_config.5.html>

* RemoteCommand サーバに接続後、リモートホストで実行されるコマンド。
* RequestTTY 接続先のサーバでシェルを起動するかを指定する。

### RequestTTY

RequestTTYは4つの値のうちの1つを持つことができます

* `no` - SSHは端末の出力を要求しません。
* `yes` - SSHは、その入力元が端末でもある場合に端末出力を要求します。
* `force` - SSHは、入力ソースの種類にかかわらず、常に端末の出力を要求します。
* `auto` -SSHは、ログインセッションを開くときに端末の出力を要求します。

RequestTTYにforceかyesをつけないと、接続後にttyが割り当てられない

### RemoteCommand

接続後にリモートで実行されるコマンド
このコマンドを実行すると切断される
