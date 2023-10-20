---
title: vim 使っているplugin
date: 2020-09-19T17:36:00+09:00
tags:
- vim
---

2020年版 [vim](Vim.md) プラグイン

<https://engineering.mercari.com/blog/entry/mercari_codecast_1/>
これをみて真面目に [vim](Vim.md) で書こうと思った
小さいやつなら十分

## vim-gitgutter

変更行にマーク表示

## fugitive

Git操作

### 注意

* `Gstatus` を実行するとshellを起動するっぽいので、zshなどでpluginもりもりだったりすると遅くて使い物にならない
* `set shell=bash\ -l` としておくと解消される

## defx

ファイラー
デフォルトのキーマッピングがないので自分で設定する
`ryanoasis/vim-devicons`, `kristijanhusak/defx-icons` を入れるとアイコンが表示される

## machakann/vim-sandwich

囲める

* `sa` で追加、`sr` で置き換え、`sb` で削除
* `saiwt` でtagを追加
* `sritt` でtagを変更
  * emmet ライクに、`div.main` などとすると `<div class="main"></div>` に展開される

## junegunn/vim-easy-align

alignment

* `gaip*|` テーブルを整形
* `gaip<Right>*,` カンマ区切り

## terryma/vim-multiple-cursors

vscode や Sublime Text の複数選択ができる <c-n>
