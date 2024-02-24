---
title: ssh host key verificationに失敗する
date: "2023-05-05T19:07:00+09:00"
tags:
  - shell
---
 

[エンジニアなら知らないとヤバいSSHの基礎 - もちゅろぐ](https://blog.mothule.com/tools/ssh/tools-ssh-basic#known_hosts%E3%81%A8%E3%81%AF)
 `~/.ssh/known_hosts` には接続経験のあるホストの公開鍵を保存してある
このファイルに書いてある公開鍵に紐づく秘密鍵があるか検証することで、万が一サーバ側の公開鍵が変更されていても気付ける仕組みとなってます。

`ssh-keygen -R $host` でknown_hostsを削除できる

### ssh-keyscan

[ssh-keyscan(1) - OpenBSD manual pages](https://man.openbsd.org/ssh-keyscan.1)
hostの公開鍵を収集する

```shell
$ ssh-keyscan github.com
# github.com:22 SSH-2.0-babeld-fc31accb
# github.com:22 SSH-2.0-babeld-fc31accb
# github.com:22 SSH-2.0-babeld-fc31accb
github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
# github.com:22 SSH-2.0-babeld-fc31accb
github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
# github.com:22 SSH-2.0-babeld-fc31accb
github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```
