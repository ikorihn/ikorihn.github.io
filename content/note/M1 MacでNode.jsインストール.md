---
title: M1 MacでNode.jsインストール
date: 2021-09-02T15:58:00+09:00
tags: null
---

\#Nodejs 

* 最新のNodeバージョンで起動に失敗するプロジェクトだったのでバージョンをさげたい

* `nodebrew install v15` は、`https://nodejs.org/dist/v16.0.0/node-v15.14.0-darwin-arm64.tar.gz` がないと言われるのでソースからビルドする必要がある

* ついでにnodebrewをやめて、取り扱いが簡単そうなnvm (zsh plugin [https://github.com/lukechilds/zsh-nvm](https://github.com/lukechilds/zsh-nvm) ) に変更

* `nvm install 15` でバイナリがなかったらソースからビルドしてくれる。ビルドに20分くらいかかる

* 異なるバージョンで入れたnode_modulesだと実行に失敗したので、一度消して再度 `yarn install`

もっといろいろ失敗するかと思ったけど意外とすんなり動いた
