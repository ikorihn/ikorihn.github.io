---
title: lazy.nvimを使っているときにローカルで開発中のプラグインを読み込む
date: 2024-07-21T23:10:00+09:00
tags:
  - Neovim
---

[[Neovim]] でプラグインを初めて作ろうとしたときに、一向に読み込まれなくてちょっとはまりました。

```shell
mkdir hello.nvim && cd hello.nvim
mkdir plugin
touch plugin/hello.vim
```

```shell
hello.nvim
└── plugin
   └── hello.vim
```

`~/.config/nvim/init.lua` に追記

```lua
vim.opt.runtimepath:append("path/to/hello.nvim")
```

これでプラグインが読み込まれなかった。

## 解答

lazyの`dir` に記載する必要があった
[lazy.nvim/doc/lazy.nvim.txt at main · folke/lazy.nvim · GitHub](https://github.com/folke/lazy.nvim/blob/main/doc/lazy.nvim.txt#L481)