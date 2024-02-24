---
title: ScoopでKaoriya版Vimをインストールする
date: "2021-05-05T20:53:00+09:00"
tags: ['Windows', 'vim']
---

Windows用のKaoriya版 [[Vim]] をインストールする

1. <https://github.com/dooteeen/scoop-for-jp> Bucketを追加する
```sh
scoop bucket add jp https://github.com/dooteeen/scoop-for-jp
```
2.   アプリの追加
```sh
scoop install vim-kaoriya
```
3. フォントの追加(全自動)
```sh
scoop install main/sudo
sudo scoop install cica -g
```
