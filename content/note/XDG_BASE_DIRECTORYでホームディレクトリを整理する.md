---
title: XDG_BASE_DIRECTORYでホームディレクトリを整理する
date: 2022-03-21T22:26:00+09:00
tags:
- shell
- zsh
---

参考
[ホームディレクトリのドットファイルを整理する。](https://chiyosuke.blogspot.com/2019/04/blog-post_27.html)

## XDG_CONFIG_HOMEとは

https://wiki.archlinux.org/title/XDG_Base_Directory に則って、 `~/.config` に設定ファイルを置くとHOMEフォルダがごちゃごちゃしなくていいようなのでやってみる。

https://www.freedesktop.org/wiki/Specifications/ によると、 'XDG'は Cross-Desktop Group のことらしい

## zshの設定ファイルを~/.configにする

環境変数 `$ZDOTDIR` が設定されていると、そのディレクトリ以下の設定ファイルを見るようになる。
zshはデフォルトで `~/.zshenv` を見るので、ここに書いても良いのだが、 `~/.zshenv` と `~/.config/zsh/.zshenv` が存在することになりちょっと気持ち悪い。
ここではシステムの `/etc/zshenv` に書くことにした。

`sudo vim /etc/zshenv`

````shell
export ZDOTDIR=$HOME/.config/zsh
````

これで `~/.config/zsh/.zshenv(, .zshrcなど)` が読み込まれるようになる。

## 環境変数を設定

````shell:~/.zsh/.zshenv
export XDG_CONFIG_HOME=~/.config
export XDG_CACHE_HOME=~/.cache
export XDG_DATA_HOME=~/.local/share
export XDG_STATE_HOME=~/.local/state
````

## [Vim](note/Vim.md)

[Neovim](note/Neovim.md) を使っている。もともと `$XDG_CONFIG_HOME/nvim/init.vim` を見るようになっていて、特別な設定はいらないのだが、vimの設定と統一しておきたかったので以下のようにした。
vimはほぼ起動しないので、init.vimに書いてしまっても良かったのだがなんとなくこうしている。

````vim:~/.config/nvim/init.vim
set runtimepath+=$XDG_CONFIG_HOME/nvim,$XDG_CONFIG_HOME/nvim/after
set packpath+=$XDG_CONFIG_HOME/nvim
source $XDG_CONFIG_HOME/nvim/vimrc
````

````vim:~/.config/nvim/vimrc
let $VIM_CACHE = expand('$XDG_CACHE_HOME/vim')
let $VIM_HOME = expand('$XDG_CONFIG_HOME/nvim')

" ディレクトリが無かったら作る
if !isdirectory(expand($VIM_CACHE))
  call mkdir(expand($VIM_CACHE), 'p')
endif

" backup, undo
set backup
set backupdir=$VIM_CACHE/backup
if !isdirectory(expand('$VIM_CACHE/backup'))
  call mkdir(expand('$VIM_CACHE/backup'), 'p')
endif
set noswapfile
set undodir=$VIM_CACHE/undo
set undofile
if !isdirectory(expand('$VIM_CACHE/undo'))
  call mkdir(expand('$VIM_CACHE/undo'), 'p')
endif

" viminfoファイルを~/.cacheに作る
set viminfo+=n$VIM_CACHE/viminfo

" sessionファイルを~/.cacheに作る
let g:session_path = expand('$VIM_CACHE/sessions')
if !isdirectory(g:session_path)
    call mkdir(g:session_path, "p")
endif

" ... その他設定

````
