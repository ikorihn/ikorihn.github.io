---
title: Git fatal detected dubious ownership in repositoryエラー
date: 2022-12-28T16:39:00+09:00
tags:
- git
lastmod: 2022-12-28T16:39:00+09:00
---

\#git

## 事象

gitの操作時に以下のメッセージが出て困った。

````shell
$ git fetch
fatal: detected dubious ownership in repository at '/path/to/repo'
To add an exception for this directory, call:

    git config --global --add safe.directory /path/to/repo
````

## 原因

[CVE-2022-24765](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-24765) の脆弱性への対応としてgit 2.35.2で入った `safe.directory` 関連の変更によるもの。

共有ディレクトリにリポジトリがある場合、さらに上位のディレクトリに「.git」ディレクトリを作成し、不正に設定を読み込ませることができるといった脆弱性

https://git-scm.com/docs/git-config/2.35.2#Documentation/git-config.txt-safedirectory
[「Git 2.35.2」が公開 ～2件の脆弱性を修正【4月14日追記】 - 窓の杜](https://forest.watch.impress.co.jp/docs/news/1402486.html)

git clone先のディレクトリのownerが現在のユーザーでない場合にこのエラーが発生する

ちなみに `go get` もgit cloneしているのでリポジトリから取得する際にこの事象が発生して、
CIサーバー上で共有ディレクトリに $GOMODCACHE を置いている場合に困ってしまう

## 対応

ディレクトリのownerをgit操作するユーザーにする。
それができない場合、フォルダ名がわかっているなら、エラーメッセージに出てきたとおりに `safe.directory` に追加する。

`git config --global --add safe.directory /path/to/repo`

`go get` する際には `$GOMODCACHE/cache/vcs/abcdef12345` のようなハッシュっぽいディレクトリにダウンロードされるので、
これをいちいち追加するのは辛い。

`git config --global --add safe.directory *` とすることで、すべてのディレクトリを許可することができ、これで解消はできた。
が、セキュリティ的にはすべてを許可してしまうので良くないと思う。。

[bash - How to add directory recursively on git safe.directory? - Stack Overflow](https://stackoverflow.com/questions/71855882/how-to-add-directory-recursively-on-git-safe-directory)
2.36 時点では、recursiveにディレクトリを指定する方法はなく `*` で指定するしかないようだった。

なにかしら対応が出るまでは `*` 指定にする
