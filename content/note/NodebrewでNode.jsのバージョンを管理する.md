---
title: NodebrewでNode.jsのバージョンを管理する
date: 2021-06-06T15:35:00+09:00
lastmod: 2021-06-06T15:35:49+09:00
tags:
- Nodejs
---

\#Nodejs

プロジェクト間でNode.jsのバージョンが違う場合に、ひとつのPC内で複数のNode.jsバージョンを使い分けたいことがある。
そんなときに [Nodebrew](https://github.com/hokaccha/nodebrew) や [nvm](https://github.com/nvm-sh/nvm) を使う

GitHubのスター数的には圧倒的にnvmが人気のようだが使ったことがないのでNodebrewの使い方を紹介する

Macのインストール手順となる

### インストール

````shell
$ brew install nodebrew
````

### PATHに追加する

`.bashrc` や `.zshrc` に追記する

````shell
export PATH=$HOME/.nodebrew/current/bin:$PATH
````

then reload

````shell
$ source ~/.bashrc
````

### 使いたいバージョンのNode.jsをインストール

````shell
$ nodebrew ls-remote
=> 利用できるNode.jsバージョンの一覧
$ nodebrew install-binary <version>
$ nodebrew use <version>
$ node -v
=> インストールしたNode.jsのバージョンが表示
````
