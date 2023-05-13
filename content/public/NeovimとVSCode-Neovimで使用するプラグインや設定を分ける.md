---
title: NeovimとVSCode-Neovimで使用するプラグインや設定を分ける
date: 2023-05-05T20:26:00+09:00
tags:
- Neovim
- vscode
---

これは [Vim駅伝](https://vim-jp.org/ekiden/) 5/15 の記事です。

## はじめに

私は普段 [Neovim](note/Neovim.md) をメインにしていますが、
他の人と環境を合わせたいときなど [VS Code](note/Visual%20Studio%20Code.md) もときどき使っています。

Vimの機能を利用するため [VSCodeVim](https://github.com/VSCodeVim/Vim) を入れている方も多いと思いますが、Undoの挙動が不安定だったりもっさりしていたりで不満があったため、 [VSCode Neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) を使っています。

これはバックグラウンドでNeovimが動作するため、共通の設定ファイル(`init.lua`)が利用できて、Neovimのプラグインも動くところが嬉しいのですが、
VS Codeにはデフォルトで備わっている機能や、うまく動作しないプラグイン、一部のoptionや衝突するkey mappingは除外したいです。

この記事では、そうしたNeovimとVSCode Neovimを併用していて、プラグインや設定を使い分けたい！という方向けに、
私が設定してうまくいっている方法について紹介しようと思います。

プラグインマネージャとして [packer.nvim](https://github.com/wbthomason/packer.nvim) と[lazy.nvim](https://github.com/folke/lazy.nvim) のそれぞれについて紹介します。

ちなみに私の設定はこちらのようになっています。
https://github.com/ikorihn/dotfiles/blob/master/.config/nvim

## packerの場合

`init.lua` とpluginはこちらのように設定しています。

`~/.config/nvim/init.lua`

````lua
require("options")
require("keymaps")
require("plugins")
require("packer_compiled")
````

`~/.config/nvim/lua/plugins.lua`

````lua
local fn = vim.fn

-- Automatically install packer
local install_path = fn.stdpath "data" .. "/site/pack/packer/start/packer.nvim"
if fn.empty(fn.glob(install_path)) > 0 then
  PACKER_BOOTSTRAP = fn.system {
    "git",
    "clone",
    "--depth",
    "1",
    "https://github.com/wbthomason/packer.nvim",
    install_path,
  }
  print "Installing packer close and reopen Neovim..."
end

vim.cmd [[packadd packer.nvim]]

local packer = require("packer")
local util = require("packer.util")
packer.init {
  compile_path = util.join_paths(vim.fn.stdpath('config'), 'lua', 'packer_compiled.lua'),
}

return packer.startup(function(use)
  use { "wbthomason/packer.nvim" }

  -- plugins...

end)

````

### cond でロードする条件を設定する

`cond` でプラグインをロードする条件を設定することができます。
VS Codeと併用するときによく紹介されるやり方はこちらだと思います。

たとえば次のように書くと、VS Codeのときにはdisableにするといったことができます。

````lua
local nocode = function()
  -- VSCode Neovimのときには1が設定される
  return vim.g.vscode == nil
end

return packer.startup(function(use)
  use { "wbthomason/packer.nvim" }

  use { "phaazon/hop.nvim", config = function() require("hop").setup() end }

  -- vscodeでないときだけロードする
  use { "kylechui/nvim-surround", config = function() require("nvim-surround").setup() end, cond = { nocode } }

end)

````

これには以下の問題がありました。

* vscodeのときにロードしたくないプラグイン一つずつに書く必要があり面倒な上、数が多いとどれがロードされる/されないのかが視認しづらかった
* condを書くと`~/.local/share/nvim/site/pack/packer/opt` にプラグインがダウンロードされるが、colorschemeなど一部のプラグインをoptionalにすると、ロードのタイミングがずれるためか正しく動作しなかった
  * 例 [Question: what to use to make plugin inactive if condition · Issue #288 · wbthomason/packer.nvim](https://github.com/wbthomason/packer.nvim/issues/288)

そこで、次のようにして解決しました。

### `init.lua` で読み込む設定ファイルを分ける

VS Codeのときだけ利用したいプラグインや設定をかいたファイル(`vscode.lua`)を別で作り、 `init.lua` で読み込むファイルを分けるようにしました。

`~/.config/nvim/init.lua`

````lua
-- 共通の設定
require("options")
require("keymaps")

if vim.g.vscode == 1 then
  -- VS Code用の設定
  require("vscode")
  return
end

require("plugins")
require("packer_compiled")
````

また、VS Codeのときもpackerを使いたかったのですが、競合してしまってうまくいかなかったので [vim-plug](https://github.com/junegunn/vim-plug) を使うことにしました。
エレガントな方法ではないと思いますが、結局これが一番安定しました。

`~/.config/nvim/lua/vscode.lua`

````lua
-- ~/.local/share/nvim/site/pack/*/start/* を読み込ませない
vim.opt.packpath:remove(vim.fn.stdpath('data').."/site")

-- Plug
-- Automatically install plug
local plugpath = vim.fn.stdpath("data") .. "/plugged/vim-plug"
if not vim.loop.fs_stat(plugpath) then
  vim.fn.system({
    "curl",
    "-fLo",
    plugpath .. "/autoload/plug.vim",
    "--create-dirs",
    "https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim",
  })
end
vim.opt.rtp:prepend(plugpath)

-- packerでダウンロード済みのプラグインを利用する
vim.cmd [[ call plug#begin(stdpath('data') . '/site/pack/packer/start') ]]

vim.cmd [[ Plug 'phaazon/hop.nvim' ]]
vim.cmd [[ Plug 'junegunn/vim-easy-align' ]]
vim.cmd [[ Plug 'jeetsukumaran/vim-indentwise' ]]
vim.cmd [[ Plug 'haya14busa/vim-asterisk' ]]
vim.cmd [[ Plug 'kevinhwang91/nvim-hlslens' ]]
vim.cmd [[ Plug 'kylechui/nvim-surround' ]]

vim.cmd [[ call plug#end() ]]

require("pluginconfig/hop")
require("pluginconfig/nvim-surround")
require("pluginconfig/nvim-hlslens")
````

### packpathについて

2行目の `vim.opt.packpath:remove(vim.fn.stdpath('data').."/site")` がハックっぽいですが、これを書いていないと `vscode.lua` に書いていないプラグインもロードされてしまいます。

runtimepathを見てみると、追加した覚えのない `~/.local/share/nvim/site/pack/*/start/*` があります。

````
:se runtimepath
runtimepath=~/.config/nvim,/opt/homebrew/etc/xdg/nvim,/etc/xdg/nvim,~/.local/share/nvim/site,~/.local/share/nvim/site/pack/*/start/*,...
````

これは [packages](https://neovim.io/doc/user/repeat.html#packages) の仕組みによって [packpath](https://neovim.io/doc/user/options.html#'packpath') で指定されたディレクトリ配下に配置されたプラグインを起動時に読み込むためです。
私の環境では以下のように設定されていました。

````
:se packpath
packpath=~/.config/nvim,/opt/homebrew/etc/xdg/nvim,/etc/xdg/nvim,~/.local/share/nvim/site,...
````

packerはデフォルトで `vim.fn.stdpath('data')..'/site/pack/packer/start'` にプラグインをダウンロードするため、こちらに置かれたプラグインがVS Codeでも読み込まれていたというわけです。
そのため、`vim.fn.stdpath('data').."/site"` をpackpathから除外するようにしました。

## lazyの場合

最近lazy.nvimに移行したので、その場合の設定も載せておきます。こちらのほうが簡単でした。

`~/.config/lua/plugins.lua`

````lua
-- Automatically install lazy
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

local plugins = {
  -- plugins...
  { "nvim-lua/plenary.nvim"  },
}

require('lazy').setup(plugins, {
})
````

lazyではpackpath配下にダウンロードされないため、`vscode.lua` は次のようになります。

````diff
--- a/.config/nvim/lua/vscode.lua
+++ b/.config/nvim/lua/vscode.lua
@@ -1,6 +1,3 @@
--- ~/.local/share/nvim/site/pack/*/start/* を読み込ませない
-vim.opt.packpath:remove(vim.fn.stdpath('data').."/site")
-
 -- Plug
 -- Automatically install plug
 local plugpath = vim.fn.stdpath("data") .. "/plugged/vim-plug"
@@ -15,7 +12,7 @@ if not vim.loop.fs_stat(plugpath) then
 end
 vim.opt.rtp:prepend(plugpath)

-vim.cmd [[ call plug#begin(stdpath('data') .. '/site/pack/packer/start') ]]
+vim.cmd [[ call plug#begin(stdpath('data') .. '/lazy') ]]

 vim.cmd [[ Plug 'phaazon/hop.nvim' ]]
````

あるいはもっと簡単に、`vscode.lua` に分けずに `plugins.lua` 内で完結することもできます。

````lua
local plugins;
if vim.g.vscode == 1 then
  plugins = {
    { "phaazon/hop.nvim", config = function() require("pluginconfig/hop") end },
    { "junegunn/vim-easy-align" },
    { "kylechui/nvim-surround", config = function() require("pluginconfig/nvim-surround") end },
  }
else
  -- Neovimで利用するプラグイン
  plugins = {
    { "nvim-lua/plenary.nvim"  },
    { "windwp/nvim-autopairs", config = function() require("pluginconfig/autopairs") end },
  }
end

require('lazy').setup(plugins, {
})
````

## おわりに

数ヶ月ほど使っていますが、今のところ特に問題は発生せず、必要なプラグインだけを活かして満足のいく操作ができています。

VS Codeをメインで使っているが、Vimプラグインの機能を使いたい！というようなユースケースにも刺されば幸いです。
