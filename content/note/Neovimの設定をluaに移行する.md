---
title: Neovimの設定をluaに移行する
date: 2022-08-21T18:38:00+09:00
tags:
- Neovim
---

[Neovim](note/Neovim.md) 0.5からは `init.lua` にlua言語で書くことができるようになっている。
最近のpluginの説明文を見るとluaで書かれていることが増えてきた。

plugin managerは [packer.nvim](https://github.com/wbthomason/packer.nvim) がメジャーらしい

[wezterm](note/wezterm.md) の設定もluaで書いているし、なんとなく今風な気がするのでluaに移行してみようとおもう

* <https://github.com/willelz/nvim-lua-guide-ja/blob/master/README.ja.md>
* [Neovim プラグインを（ほぼ）全て Lua に移行した](https://zenn.dev/acro5piano/articles/c764669236eb0f)

## 概要

[NeovimとLua](https://zenn.dev/hituzi_no_sippo/articles/871c06cdbc45b53181e3)

[Vimconf.live: Why is Lua a good fit for Neovim - YouTube](https://www.youtube.com/watch?v=IP3J56sKtn0)

* 簡単  
  Luaの学習コストは低く、誰でもすぐ書けます。
* Luaのサイズが小さい  
  バイナリサイズ（linux用）は200KB以下です。
* 移植性  
  ISO Cで実装されているため、OS Kernel内でもLuaは実行できます。
* 埋め込みに適している。  
  Vim scriptからLuaの関数を呼び出すことができます。その逆もできます。
* Vim scriptよりスピードが早い  
  Vim scriptなら約5.5秒かかる処理をLua(LuaJIT)は約0.003秒で処理します。

Vim scriptよりは書きやすいっぽい。Vim script書いたことないけど

* 複数行文字列

````lua
[[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost plugins.lua source <afile> | PackerSync
  augroup end
]]
````

オプションやキーマップを関数で書ける

## <https://github.com/nanotee/nvim-lua-guide> で勉強する

* `require('modules/mymodule')` で、`./modules/mymodule.lua` をロードできる
* luado

````vim
:luado return 'hello world'
````

とすると現在のbufferにテキストが挿入される

````vim
:luado if linenr % 2 == 0 then return line:upper() end
````

で、偶数行が大文字になる

* `:luafile %` でカレントバッファをluaで実行する

### vim名前空間

* LuaからNeovimのAPIを使うためのエントリーポイントとして、vimグローバル変数を公開している
  * `vim.inspect`: Luaオブジェクトを人間が読みやすい文字列に変換する(テーブルを調べるのに便利です。)
  * `vim.regex`: LuaからVimの正規表現を使う
* `vim.nvim_exec('%s/\\Vfoo/bar/g')` のようにして、vim scriptを実行できる

### vim option

* `vim.api.nvim_set_option()`, `vim.api.nvim_get_option()` などで読み書きできる
* `vim.opt.{option}`: `:set`のように動作します
* `vim.opt_global.{option}`: `:setglobal`のように動作します
* `vim.opt_local.{option}`: `:setlocal`のように動作します

### vim variable

* Global variables (`g:`):
  * [`vim.api.nvim_set_var()`](https://neovim.io/doc/user/api.html#nvim_set_var())
  * [`vim.api.nvim_get_var()`](https://neovim.io/doc/user/api.html#nvim_get_var())
  * [`vim.api.nvim_del_var()`](https://neovim.io/doc/user/api.html#nvim_del_var())

Local variables (l:), script variables (s:) and function arguments (a:) はVim script特有のスコープで、Luaは独自のスコープを持っているので使わない

* `vim.g`: global variables
* `vim.b`: buffer variables
* `vim.w`: window variables
* `vim.t`: tabpage variables
* `vim.v`: predefined Vim variables
* `vim.env`: environment varia

### call Vimscript functions

`vim.fn.{funcion}()` でVimscript functionを呼ぶ

例: `print(vim.fn.printf('Hello from %s', 'Lua'))`

### keymap

* グローバルマッピング:
  * [`vim.api.nvim_set_keymap()`](https://neovim.io/doc/user/api.html#nvim_set_keymap())
  * [`vim.api.nvim_get_keymap()`](https://neovim.io/doc/user/api.html#nvim_get_keymap())
  * [`vim.api.nvim_del_keymap()`](https://neovim.io/doc/user/api.html#nvim_del_keymap())

例: `vim.api.nvim_set_keymap('n', '<Leader><Space>', ':set hlsearch!<CR>', { noremap = true, silent = true })`

Neovim provides two functions to set/del mappings:

* `vim.keymap.set()`
* `vim.keymap.del()`

````lua
vim.keymap.set('n', '<Leader>ex1', '<Cmd>lua vim.notify("Example 1")<CR>')
vim.keymap.set({'n', 'c'}, '<Leader>ex2', '<Cmd>lua vim.notify("Example 2")<CR>')
````

### user commands

* Global user commands:
  * [`vim.api.nvim_create_user_command()`](https://neovim.io/doc/user/api.html#nvim_create_user_command())
  * [`vim.api.nvim_del_user_command()`](https://neovim.io/doc/user/api.html#nvim_del_user_command())

## 参考にしたもの

* [GitHub - NvChad/NvChad: An attempt to make neovim cli functional like an IDE while being very beautiful, blazing fast startuptime ~ 14ms to 67ms](https://github.com/NvChad/NvChad)
* [GitHub - LunarVim/nvim-basic-ide: This is my attempt at a basic stable starting point for a Neovim IDE.](https://github.com/LunarVim/nvim-basic-ide)
  * 
     > 
     > A Basic Stable IDE config for Neovim
  
  * Neovim初心者がIDEっぽい動きをさせるように便利なテンプレ
  * <https://github.com/hisasann/neovim>
    * この人の設定が上をベースにわかりやすくなってたので真似させてもらった

## 変更点

### functionの書き方

````lua
function ToggleQuickFix()
  if vim.fn.empty(vim.fn.filter(vim.fn.getwininfo(), "v:val.quickfix")) == 1 then
    vim.cmd([[copen]])
  else
    vim.cmd([[cclose]])
  end
end

-- :ToggleQuickFix で使えるようにする
vim.cmd([[command! -nargs=0 -bar ToggleQuickFix lua require('utils').ToggleQuickFix()]])

-- keymapに設定する
vim.keymap.set("n", "<Leader>q", ToggleQuickFix)
````

### plugin

luaで書かれたpluginに移行した

* [GitHub - wbthomason/packer.nvim: A use-package inspired plugin manager for Neovim. Uses native packages, supports Luarocks dependencies, written in Lua, allows for expressive config](https://github.com/wbthomason/packer.nvim)
  * Neovimのplugin managerのデファクト
* [GitHub - phaazon/hop.nvim: Neovim motions on speed!](https://github.com/phaazon/hop.nvim)
  * easymotionをluaで書き直したもの
* [GitHub - kylechui/nvim-surround: Add/change/delete surrounding delimiter pairs with ease. Written with in Lua.](https://github.com/kylechui/nvim-surround)
  * surroundとかsandwichのようなもの
* [GitHub - kyazdani42/nvim-tree.lua: A file explorer tree for neovim written in lua](https://github.com/kyazdani42/nvim-tree.lua)
  * file explorer
* [GitHub - nvim-lualine/lualine.nvim: A blazing fast and easy to configure neovim statusline plugin written in pure lua.](https://github.com/nvim-lualine/lualine.nvim)
  * statuslineカスタマイズ
* [GitHub - lukas-reineke/indent-blankline.nvim: Indent guides for Neovim](https://github.com/lukas-reineke/indent-blankline.nvim)
  * indentline
* [GitHub - RRethy/vim-illuminate: illuminate.vim - Vim plugin for automatically highlighting other uses of the word under the cursor. Integrates with Neovim's LSP client for intelligent highlighting.](https://github.com/RRethy/vim-illuminate)
  * highlightをつける

### colorscheme

* [GitHub - EdenEast/nightfox.nvim: 🦊A highly customizable theme for vim and neovim with support for lsp, treesitter and a variety of plugins.](https://github.com/EdenEast/nightfox.nvim)
* [GitHub - ellisonleao/gruvbox.nvim: Lua port of the most famous vim colorscheme](https://github.com/ellisonleao/gruvbox.nvim)

### LSP

[Neovim+LSPをなるべく簡単な設定で構築する](https://zenn.dev/botamotch/articles/21073d78bc68bf)

* [neovim/nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)（LSP設定）
* [williamboman/mason.nvim](https://github.com/williamboman/mason.nvim)（LSPサーバー管理）
  * [williamboman/mason-lspconfig.nvim](https://github.com/williamboman/mason-lspconfig.nvim)
* [hrsh7th/nvim-cmp](https://github.com/hrsh7th/nvim-cmp)（補完）
  * [hrsh7th/cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp)

## 結果

* 起動が200ms -> 100ms未満になった
* colorschemeをnightfoxにした
* nvim-cmpやnvim-lspに変えて、補完の見た目がかっこよくなった

![Pasted-image-20220813171640](note/Pasted-image-20220813171640.png)
