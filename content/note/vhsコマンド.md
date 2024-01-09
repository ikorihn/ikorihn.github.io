---
title: vhsコマンド
date: 2023-12-25T17:51:00+09:00
tags:
- terminal
---

{{< card-link "https://github.com/charmbracelet/vhs/tree" >}}

*ターミナル* の操作を録画して、Gifを作成してくれる [Go](note/Go.md) 製のツール。
一連の操作を `.tape` ファイルに記述してvhsコマンドに読み込ませることで、いつでも再現することができるのが特徴。
これにより撮り直しするのが容易になる。

## インストール

ffmpeg, ttydが必要となる。
vhsは brewや `go install` でインストールできる

## チュートリアル

````sh
❯ vhs new demo.tape
Created demo.tape

❯ cat demo.tape
Output demo.gif

Require echo

Set Shell "bash"
Set FontSize 32
Set Width 1200
Set Height 600

Type "echo 'Welcome to VHS!'" Sleep 500ms  Enter

Sleep 5s

❯ vhs demo.tape
File: demo.tape
Host your GIF on vhs.charm.sh: vhs publish <file>.gif
Output .gif demo.gif
Require echo
Set Shell bash
Set FontSize 32
Set Width 1200
Set Height 600
Type echo 'Welcome to VHS!'
Sleep 500ms
Enter 1
Sleep 5s
Creating demo.gif...

````

![](note/20231225180236.gif)

## 使い方

* `Type@.2` や `Tab@200ms` といった書き方で、キー入力のあとに遅延を入れる
* `Enter 3` のようにすると、3回コマンドを実行できる
* エディタを開いて入力して閉じるといったことも可能

````shell
Type "vim"
Enter
Type@.2 "ihello, world"
Escape
Type ":wq"
Enter
````
