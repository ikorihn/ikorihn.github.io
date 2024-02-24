---
title: Windowsのgit設定
date: '2021-05-03T10:38:00+09:00'
tags:
  - 'Windows'
  - 'git'
---

```sh
# ファイルの大文字・小文字を区別して認識する
$ git config --global core.ignorecase false
# 日本語のファイル名が文字化けしないでちゃんと表示される
$ git config --global core.quotepath false
# 改行コードが混在している場合は変換しない
$ git config --global core.safecrlf true
# 改行コードが混在している場合は変換しない
$ git config --global core.autocrlf false
```
