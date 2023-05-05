---
title: Vimでバッファ同士の差分をとる
date: 2021-05-06T18:14:00+09:00
tags:
- vim
---

[意外と知られていない diff に関する機能 - 永遠に未完成](https://thinca.hatenablog.com/entry/20130426/1366910837)

## diffthis

ファイル同士のときは `:diffsplit` が使えるが、バッファ同士の場合は `:diffthis` しか使えない

1. Vimを起動してそのままdiffを取りたい内容を貼り付け
1. enewで新しいバッファを開く
1. 1.のバッファと比べたい内容を貼り付け
1. 3.のバッファでdiffthis
1. 1.のバッファでdiffthis
