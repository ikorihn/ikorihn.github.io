---
title: ssh 踏み台で su user してから接続するssh先をsshconfigで設定する
date: 2023-01-24T15:22:00+09:00
tags:
- 2023/01/24
- shell
---

ローカル -> 踏み台 -> 許可されたユーザーにsuする -> ターゲットにssh というケース

## functionを作る

````shell
function ssh_via_bastion() {
    ssh -t bastion_host "su - superuser -c 'ssh $1'"
}
ssh_via_bastion <target_host>
````

これでもいいが、sshコマンドじゃないしできれば `.ssh/config` で一括管理したい

## .ssh/configに設定する

踏み台経由で真っ先に思い浮かぶのは `ProxyCommand` を使ったやり方

````ssh-config
Host host-you-want-to-access
  ProxyCommand ssh -W %h:%p <bastion_host>
  HostName <target_host>
````

これは踏み台にsshするときのユーザーと、踏み台からtarget_hostにsshするときのユーザーが同じなら問題ない。
今回は踏み台で別のユーザーになる必要がある。

`RemoteCommand` で、sshした先でコマンドを実行することができる

````ssh-config
Host host-you-want-to-access
  # これ！
  RemoteCommand sudo su - root -c 'ssh <target_host>'
  # tty割当しないと対話できない
  RequestTTY force
  HostName <bastion_host>
````

````shell
$ ssh host-you-want-to-access
=> 踏み台経由でアクセスできる
````
