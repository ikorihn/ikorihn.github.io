---
title: git shallow cloneとsparse checkoutを活用
date: "2022-12-09T15:11:00+09:00"
tags:
  - 'git'
lastmod: "2022-12-09T15:11:00+09:00"
---

#git

## Shallow clone

`depth` を指定すると、その数のコミットログだけを取得するので、コミット数の多いリポジトリでデータ量を削減できる。

```shell
$ git clone --depth=1 git@github.com:git/git.git

# -b <branch> でブランチ指定
$ git clone --depth=1 -b main git@github.com:git/git.git
```

git log で過去のログを見ることはできない。CIなどでビルドするときによく使われる

## Sparse checkout

[[git-sparse-checkout]]

リポジトリの中で必要なファイルだけを展開することで、ディスク使用量を削減できる。

shallow cloneと組み合わせて、`depth=1` で取得したあとファイルの展開をしない

```shell
# clone後ファイルを展開しない
$ git clone --depth=1 --no-checkout git@github.com:git/git.git

$ cd git
$ mkdir .git/info

# checkoutするpath一覧を設定
$ echo "Documentation" > .git/info/sparse-checkout
# sparse checkoutを行うよう設定
$ git config core.sparsecheckout true
# checkoutする
$ git checkout -f master
```
