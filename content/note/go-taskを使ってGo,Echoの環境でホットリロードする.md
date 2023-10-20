---
title: go-taskを使ってGo,Echoの環境でホットリロードする
date: 2022-04-18T13:07:00+09:00
tags:
- Go
lastmod: 2022-04-18T13:07:00+09:00
---

\#Go

GoのホットリロードはRealizeやAirを使っていたが、[go-task](https://github.com/go-task/task) がいい感じにMakefileを置き換えてくれてホットリロードも実現できるので使ってみた。

[go-taskでサーバーのライブリロードを実現する - Qiita](https://qiita.com/croquette0212/items/dab91c1075c1f3ac7b8d)

watch機能があり、 `sources` で指定したファイルに変更があった場合にリロードしてくれる。

````shell
task -w <TASK>
````

これだけだと、起動済みサーバーを終了してから再起動とはならないので、PIDを保存しておいてSIGTERMでkillする
