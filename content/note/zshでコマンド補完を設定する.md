---
title: zshでコマンド補完を設定する
date: 2021-10-29T17:37:00+09:00
tags:
- zsh
---

補完コマンドのあるディレクトリを `FPATH` に追加する

`~/.zshenv`

````shell
FPATH=$(brew --prefix)/share/zsh/site-functions/:$FPATH
````

````shell
fpath=($(brew --prefix)/share/zsh/site-functions/(N-/) $fpath)
````

## zinitの場合

* `as'completion'` 補完modifier
* `has'<command>'` コマンドが存在する場合

````shell
# https://github.com/BurntSushi/ripgrep
zinit ice lucid as'completion' blockf has'rg'
zinit snippet /opt/homebrew/share/zsh/site-functions/_rg

# https://github.com/sharkdp/fd
zinit ice lucid as'completion' blockf has'fd'
zinit snippet /opt/homebrew/share/zsh/site-functions/_fd
````
