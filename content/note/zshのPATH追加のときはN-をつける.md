---
title: zshのPATH追加のときはN-をつける
date: 2021-08-13T11:32:00+09:00
tags:
- zsh
---

[zsh で path にディレクトリを追加するときは (N-/) を付けよう - Qiita](https://qiita.com/mollifier/items/42ae46ff4140251290a7)

````shell
# 間違いではない
path=($HOME/bin $path)
# よりよい
path=($HOME/bin(N-/) /usr/local/bin(N-/) $path)
````

## 解説

`(N-/)` はファイル名修飾子
ファイル名に条件つけて絞り込みができるようになる。

* `/`
  * ディレクトリが存在するときだけ `()` の左側の値に展開される。
  * ディレクトリが存在しない場合や、ファイル、シンボリックリンクの場合にエラー
* `N`
  * ディレクトリが存在しないときにエラーではなく空文字に展開される
* `-`
  * シンボリックリンクの実態を追いかける

````shell
$ ls -1 /
Applications
bin
cores
dev
etc -> private/etc
home -> /System/Volumes/Data/home
Library
opt
private
sbin
System
tmp -> private/tmp
Users
usr
var -> private/var
Volumes

$ echo /tmp
/tmp

$ echo /tmp(/)
zsh: no matches found: /tmp(/)

$ echo /tmp(N/)

$ echo /private/tmp(N/)
/private/tmp

$ echo /tmp(N-/)
/tmp
````
