---
title: slack RTMを使用しているアプリケーションをSocket modeにアップデートする
date: 2023-10-24T19:37:00+09:00
tags:
- Slack
---

Slackは [RTMのサポートを終了](https://api.slack.com/rtm) していて、すでに新規作成はできなくなっている。
いつまでも使い続けるのもよくないしいつ廃止されるかわからないので、新しい方式に変更することにした。
Socket modeを利用するようにアナウンスされている。

余談だが[Slackアプリの一覧画面](https://api.slack.com/apps)の場所がいつもわからなくなる。Slackから一発で開けるようにしてくれ

## 更新

OAuth & Permissionsの画面で、警告が出ていて新しい権限に移行してくださいのボタンが出ているのでそこから更新する。
必要な権限を付与してOKを押す。

このとき、RTMが使用できなくなるのでSocket Modeに移行してくださいと警告がでる。
問題なければ続行する。

権限の更新ができたら、Reinstall to workspace する。

## Socket modeに移行する

左サイドバーの Settings > Socket Mode から `Enable Socket Mode` として、Token nameを入力する。
作成すると `xapp-` で始まるトークンが作成されるので、これをコピーする。
これがSocket Modeで通信するときに必要となる。

### チャンネルの投稿を読み取るには

`channels:history` の権限だけでは足りなくて、 Event Subscriptions の設定が必要となる。
Enable Eventsにして、Bot User Eventに `message.channels` を追加する。

さらに、チャンネルにAppを招待する必要がある。 
`/invite` から Add apps to this channel で追加してあげると、このチャンネルのメッセージ読み取りや投稿ができるようになる。

## 困ったこと

botのときは、招待されていないチャンネルに対しても投稿を読み取ったりメッセージを送信したりできていたが、更新後は招待されたチャンネルにしか操作できないようになっていた。
これ自体はより安全になるので嬉しいことだが、一個一個招待するのが大変だった。
