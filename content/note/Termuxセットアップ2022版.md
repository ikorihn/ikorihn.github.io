---
title: Termuxセットアップ2022版
date: "2023-05-05T20:18:00+09:00"
tags:
  - terminal
---

### [F-Droid](https://www.f-droid.org/)からインストールする

https://play.google.com/store/apps/details?id=com.termux

> NOTE: Updates over Google Play is currently halted due to technical reasons.
> In the meantime, see https://github.com/termux/termux-app#installation for alternative installation sources.

にある通りGoogle Playからのインストールは推奨されていないので、F-Droidからインストールする

F-Droidを開いてTermuxをインストールする。

### 初期設定

Termuxを開いて使いたいものをインストールする

```shell
$ pkg update
$ pkg install vim git openssh
```

あとの手順

- [[Termux SSHセットアップ]] の通りssh鍵生成やファイルのやり取りをする
- [[Obsidianをスマホと同期する]]
