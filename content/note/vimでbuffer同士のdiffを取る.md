---
title: vimでbuffer同士のdiffを取る
date: "2022-03-04T13:22:00+09:00"
tags: 
    - 'vim'
---



1. vimを開く
2. テキストを貼り付ける
3. `:vnew` でウィンドウを開く
4. 比較したいテキストを開いたウィンドウに貼り付け
5. `:windo diffthis`
6. `:diffoff` で終了


[[ファイル同士の比較をvimdiffで取る]]
