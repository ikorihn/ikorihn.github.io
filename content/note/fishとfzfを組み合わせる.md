---
title: fishとfzfを組み合わせる
date: "2021-05-11T22:13:00+09:00"
lastmod: '2021-05-11T22:15:25+09:00'
tags:
  - 'fish'
  - 'shell'
---

<https://github.com/jethrokuan/fzf> を使っていた

## 問題

ファイル名、ディレクトリ名にスペースが含まれていると、tab補完したときに正しく展開されない

## 解決策

<https://github.com/PatrickF1/fzf.fish> を使うようにした

標準の `CTRL-T` を使うだけでもいい気がする
