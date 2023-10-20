---
title: vimでbuffer同士のdiffを取る
date: 2022-03-04T13:22:00+09:00
tags:
- vim
---

1. vimを開く
1. テキストを貼り付ける
1. `:vnew` でウィンドウを開く
1. 比較したいテキストを開いたウィンドウに貼り付け
1. `:windo diffthis`
1. `:diffoff` で終了

[ファイル同士の比較をvimdiffで取る](note/ファイル同士の比較をvimdiffで取る.md)
