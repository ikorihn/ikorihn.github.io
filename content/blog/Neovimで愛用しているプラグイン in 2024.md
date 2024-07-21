---
title: Neovimで愛用しているプラグイン in 2024
date: 2024-07-17T14:02:00+09:00
tags:
  - Neovim
---
 
## はじめに

Neovim使用歴約4年のエンジニアが普段特によく使っているプラグインを紹介します。

途中に貼ったgifは [vhs](https://github.com/charmbracelet/vhs), [nvim-keycastr](https://github.com/4513ECHO/nvim-keycastr) を使って撮影しました

参考 [VHS で楽に Neovim のデモ動画を録る](https://zenn.dev/vim_jp/articles/2024-07-15-vim-vhs-and-neovim)


## surround, sandwich

文字列を囲う/囲い文字を削除・変更する

![](./neovim-favorite-plugin-2024/surround.gif)

- ★ https://github.com/kylechui/nvim-surround
- https://github.com/tpope/vim-surround
- https://github.com/machakann/vim-sandwich


## align

文字列を記号で整列する

![height:400](./neovim-favorite-plugin-2024/align.gif)


- ★ https://github.com/echasnovski/mini.align
- https://github.com/junegunn/vim-easy-align

## textcase

camelCase, snake_case, kebab-caseなどを相互に変換する
LSPと連携も可能

![height:400](./neovim-favorite-plugin-2024/textcase.gif)

- ★ https://github.com/johmsalas/text-case.nvim

Telescopeと連携します

## hop, easymotion

キータイプで任意の箇所にジャンプする

![height:400](./neovim-favorite-plugin-2024/hop.gif)

- ★ https://github.com/smoka7/hop.nvim
- https://github.com/easymotion/vim-easymotion

## gitsigns

Gitの差分の表示、前後の差分への移動、stageやresetなどの操作

![height:400](./neovim-favorite-plugin-2024/gitsigns.gif)


- ★ https://github.com/lewis6991/gitsigns.nvim

## diffview

すべての変更されたファイルを見たい場合に便利

![height:400](https://user-images.githubusercontent.com/2786478/131269942-e34100dd-cbb9-48fe-af31-6e518ce06e9e.png)

- ★ https://github.com/sindrets/diffview.nvim

git mergetoolとして使ったり、fileのヒストリーを見たりといったことが可能
