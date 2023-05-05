---
title: git-sparse-checkout
date: 2021-06-10T11:20:00+09:00
lastmod: 2021-06-10T11:29:13+09:00
tags:
- git
---

\#git

<https://git-scm.com/docs/git-sparse-checkout>

リポジトリから一部だけを取得する設定
必要なのが巨大なリポジトリのうちの1ファイルだけの場合などに、
全体をcheckoutすると容量を食うので、ファイルやディレクトリを指定してcheckoutすることができる

## sparse checkout を利用してみる

1. まずは空っぽのローカルリポジトリを作成

````shell
git init .
````

2. ローカルリポジトリ内で以下のコマンドを実行。 gitconfigファイルに `sparsecheckout=true` の1行が追加されます。

````shell
git config core.sparsecheckout true
````

3. .git/info以下にsparse-checkoutという名前のファイルを作成。

````shell
mkdir .git/info
vi .git/info/sparse-checkout
````

4. 必要なファイルやディレクトリを記述していきます。 記述方法は.gitignoreと同じで、ファイル名やディレクトリ名の先頭に「!」を付けると除外指定もできます。

````gitignore
hoge.txt
/fuga
!/fuga/piyO
````

5. リモートリポジトリを指定します。

````shell
git remote add origin XXXX
````

6. 最後にpull

````shell
git pull origin master
````

## 一部だけを除外したい

一度全体をcheckout対象に含めてから、除外したいものだけを `!` で指定するという方法

<https://git-scm.com/docs/git-sparse-checkout#_full_pattern_set>

ネストすることも可能

````gitignore
/*
!unwanted
unwanted/**/wanted
````
