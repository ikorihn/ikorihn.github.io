---
title: Alacritty,Tmux,Neovimでundercurlを表示したい
date: 2024-02-16T16:08:00+09:00
tags:
  - terminal
  - Neovim
---

undercurl=波線を引くやつを [[Alacritty]], [[tmux]], [[Neovim]] の環境で実現したかった。

[tmux, neovim環境下でもundercurl表示に対応する](https://zenn.dev/yushin_hirano/articles/e4aae8a7913f6a)
の通りにした。

## Alacrittyのterminfoを生成

https://github.com/alacritty/alacritty/blob/master/INSTALL.md#post-build

まず下のコマンドを打ってみた。

```shell
❯ infocmp alacritty
infocmp: couldn't open terminfo file (null).
```

見つからないといわれたので、マニュアル通り入れた。

```shell
❯ cd ~/src/alacritty
❯ sudo tic -xe alacritty,alacritty-direct extra/alacritty.info

# これでOK
❯ infocmp alacritty
alacritty|alacritty terminal emulator,
        am, bce, ccc, hs, km, mc5i, mir, msgr, npc, xenl,
        colors#256, cols#80, it#8, lines#24, pairs#32767,
        acsc=``aaffggiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz{{||}}~~,

```


## tmux.conf でdefault-terminalを設定

```conf title:tmux.conf
set -g default-terminal "alacritty"
set-option -sa terminal-overrides ',alacritty:RGB'
```


これでNeovimで波線がひかれるようになった。
`:terminal` を開いて `echo -e "\e[4:3mTEST"`

![[Pasted-image-20240216042030.png]]


## sshすると文字の削除が見た目上行われない

これを設定したあと、ssh中に文字を削除すると、表示上は文字が消えずにカーソルが進む事象が発生した(実際には消えている)

```
$ echo hello  _   # <- backspaceを2回おした状態。`echo hel` になっているが表示は消えていない
```

ssh先のterminfoに `alacritty` なんてないから表示が壊れるみたい。 vim を立ち上げようとすると確かに警告がでる。
[GNU screen内からsshした先にTERM=screen.xterm-256color等がない場合の対処法](https://rcmdnk.com/blog/2018/02/02/computer-bash-network/)

Neovim起動時だけでいいので、 `alias vim='TERM=alacritty nvim'` にした
