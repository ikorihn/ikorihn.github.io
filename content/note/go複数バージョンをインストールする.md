---
title: go複数バージョンをインストールする
date: 2021-05-20T16:37:00+09:00
lastmod: 2021-05-20T16:37:44+09:00
---

<https://kazuhira-r.hatenablog.com/entry/2021/02/23/200101>

<https://golang.org/doc/manage-install>

## インストール

````shell
$ go get golang.org/dl/go1.10.7
$ go1.10.7 download
````

## アンインストール

````shell
$ rm $HOME/go/bin/go1.10.7
$ rm -rf $HOME/sdk/go1.10.7
````
