---
title: ファイル同士の比較をvimdiffで取る
date: 2022-03-04T13:27:00+09:00
tags:
- vim
lastmod: 2022-03-04T13:28:00+09:00
---

## ファイル同士の比較をvimdiffで取る

````shell
$ vimdiff text.txt another.txt
# またはvim -d
$ vim -d text.txt another.txt
````

## 現在vimで開いているファイルと指定したファイルとの差分

````vim
:vertical diffsplit 差分を取りたいファイル
````

## 2つのファイルの差分をマージする

Vimでは，「diffモード」の状態で，2つのファイルの差分のマージを行うこともできる。
もう一方のファイルの差分を取り込むには、差分ハイライトされている場所で次のコマンド

````vim
:do
````

逆にもう一方に取り込ませるには

````vim
:dp
````

doは「diff obtain」，dpは「diff put」と覚える。

## 次の差分へカーソルを移動する

ノーマルモードで `]c` を入力すると次の差分へ、`[c` で前の差分へ

[2つのテキストファイルの差分を取る — 名無しのvim使い](http://nanasi.jp/articles/howto/diff/diff_text.html)
[2つのテキストファイルの差分をマージする — 名無しのvim使い](http://nanasi.jp/articles/howto/diff/merge_diff.html)
