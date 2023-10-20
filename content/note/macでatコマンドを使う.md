---
title: macでatコマンドを使う
date: 2021-08-31T20:52:00+09:00
lastmod: 2021-08-31T20:52:26+09:00
tags:
- shell
---

\#shell

[Macでatコマンドが実行できないときの対処法 - Qiita](https://qiita.com/shge/items/6c43947a77abd9d2d1b2)

````shell
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
````

`/usr/libexec/atrun` にフルディスクアクセスをつける

## コマンドの使い方

[atコマンドについて詳しくまとめました 【Linuxコマンド集】](https://eng-entrance.com/linux-command-at)

````shell
$ at 11:00
> echo "hello from at" > ~/work/at.log
[Ctrl+D]
````

* `-t [YYYY]MMDDHHmm[.SS]`: 時刻指定の書式を西暦4桁、月2桁、日2桁、時2桁、分2桁の書式で入力できる
