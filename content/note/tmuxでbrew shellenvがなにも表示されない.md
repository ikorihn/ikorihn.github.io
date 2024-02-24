---
title: tmuxでbrew shellenvがなにも表示されない
date: "2021-08-20T11:29:00+09:00"
lastmod: '2021-08-20T11:32:54+09:00'
tags:
  - 'tmux'
  - 'shell'
---


## 事象

zshでターミナルを開く
→ tmuxコマンドでtmuxを開く
→ brewでインストールしたコマンドがPATHに入っていない

zshenvで `eval $(brew shellenv)` でPATHを設定しているのだが、
`brew shellenv` コマンドを実行してもなにも表示されないのが原因のようだった

### ソースを見る

<https://github.com/Homebrew/brew/blob/master/Library/Homebrew/cmd/shellenv.sh>

`HOMEBREW_SHELLENV_PREFIX` と `HOMEBREW_PREFIX` が同じ場合は何もしないとなっている

```shell
$ echo $HOMEBREW_SHELLENV_PREFIX
/opt/homebrew

$ echo $HOMEBREW_PREFIX
/opt/homebrew
```

### ワークアラウンド

正しいかは怪しいが、環境変数を一旦クリアすることで再セットされる

<https://github.com/Homebrew/brew/issues/11851>

```shell
unset HOMEBREW_SHELLENV_PREFIX
eval $(/opt/homebrew/bin/brew shellenv)
```
