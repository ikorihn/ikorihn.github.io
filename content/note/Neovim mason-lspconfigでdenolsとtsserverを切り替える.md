---
title: Neovim mason-lspconfigでdenolsとtsserverを切り替える
date: 2023-10-01T18:25:00+09:00
tags:
- Neovim
---

`*.ts` なファイルを開いたときに、Denoのプロジェクトなんだけどtsserverが起動してしまいimportで怒られている…みたいになるのでなんとかしようと思いました。

## 最終的な設定

{{< card-link "https://github.com/ikorihn/dotfiles/blob/6445c7d0378dc00f8b9f79133011cd5986216b5b/.config/nvim/lua/lsp/lsp-installer.lua" }}

## やったこと

こちらを参考にさせていただきました。

[nvim-lspでtsserverとdenolsの競合を回避する](https://zenn.dev/kawarimidoll/articles/2b57745045b225)

* `package.json` の有無を調べて、あったらtsserver、なかったらdenolsを使用する
* わたしの場合、 `language server名: setup関数` なテーブルを作って呼び出している
