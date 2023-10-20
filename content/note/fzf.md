---
title: fzf
date: 2023-05-06T15:34:00+09:00
tags:
- 2023/05/06
- CLI
- terminal
---

[fzf](https://github.com/junegunn/fzf) は、コマンドラインでインクリメンタルにあいまい検索ができるツール。
標準出力をパイプで渡してフィルタリングしたり、カレントディレクトリ配下のファイルを再帰的に表示したりといったことができる。

[Homebrew](note/Homebrew.md) やgitでインストールできる。

````shell
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
````

installすると `~/.fzf.zsh` ができるので、shellの起動時に読み込む。

````shell
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
export FZF_DEFAULT_COMMAND='fd --type file --hidden --follow --exclude .git'
export FZF_CTRL_T_COMMAND='fd --type file --hidden --follow --exclude .git'
````
