---
title: dotfilesをchezmoi管理に移行する
date: 2023-10-29T23:58:00+09:00
tags:
- Draft
- terminal
lastmod: 2023-10-29T23:58:52+09:00
---

dotfilesはshell scriptでsymlinkを貼るようにしていたが、初期セットアップはあまりやる作業じゃない分手順を忘れがちなので、dotfiles manager的なツールに任せることにした。
最近名前をよく聞くもので chezmoi を使ってみた。

{{< card-link "https://github.com/twpayne/chezmoi" >}}

[Go](note/Go.md) で書かれているのも自分的にはいざとなったらソースを読めるのでポイント
