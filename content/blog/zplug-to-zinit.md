---
title: "zplugをzinitに移行する"
date: "2021-06-21T19:00:00+09:00"
updated-date: "2021-06-21T19:00:00+09:00"
description: "zplugをzinitに移行する"
tags: 
    - "zsh"
---

```toc
# This code block gets replaced with the TOC
```

## 移行理由

自分がターミナルで使用しているシェルの変遷

- 2016 ~ 2020/04 zsh zplug
- 2020/04 ~ 2021/04 fishに移行した
- 2021/04 ~ zshに戻った

zshのカスタマイズが面倒なのと、シェルの起動が遅かったので、カスタマイズが簡単なfishに移行したが、以下の理由でまたzshに戻ってきた

- fishはPOSIX非互換なのでコマンドを調べるのが手間
- bash/zshで作ったスクリプトを書き換える必要がある

zinitは起動が早いと聞いたので、zplugからzinitに移行する

## インストール

[公式の推奨手順](https://github.com/zdharma/zinit#automatic-installation-recommended)

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/zdharma/zinit/master/doc/install.sh)"
```

`~/.zinit` (`$ZDOTDIR` が設定されていれば `$ZDOTDIR/.zinit`) にインストールされる。
また、 `~/.zshrc` にzinitの設定が追記されるので、リロードし、Zinitをコンパイルする。

```shell
source ~/.zshrc
zinit self-update
```

## プラグインの設定

完全な例

```shell
### Added by Zinit's installer
if [[ ! -f $ZDOTDIR/.zinit/bin/zinit.zsh ]]; then
    print -P "%F{33}▓▒░ %F{220}Installing %F{33}DHARMA%F{220} Initiative Plugin Manager (%F{33}zdharma/zinit%F{220})…%f"
    command mkdir -p "$HOME/.zsh/.zinit" && command chmod g-rwX "$HOME/.zsh/.zinit"
    command git clone https://github.com/zdharma/zinit "$HOME/.zsh/.zinit/bin" && \
        print -P "%F{33}▓▒░ %F{34}Installation successful.%f%b" || \
        print -P "%F{160}▓▒░ The clone has failed.%f%b"
fi

source "$ZDOTDIR/.zinit/bin/zinit.zsh"
autoload -Uz _zinit
(( ${+_comps} )) && _comps[zinit]=_zinit

# Load a few important annexes, without Turbo
# (this is currently required for annexes)
zinit light-mode for \
    zinit-zsh/z-a-rust \
    zinit-zsh/z-a-as-monitor \
    zinit-zsh/z-a-patch-dl \
    zinit-zsh/z-a-bin-gem-node

### End of Zinit's installer chunk

zinit ice wait'1' lucid; zinit light "zdharma/fast-syntax-highlighting"
zinit light "zsh-users/zsh-autosuggestions"
zinit light "zsh-users/zsh-completions"
zinit light "zsh-users/zsh-history-substring-search"
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

zinit ice wait'1' lucid pick'init.sh'; zinit light "b4b4r07/enhancd"
zinit ice wait'1' lucid; zinit light "reegnz/jq-zsh-plugin"

zinit ice wait'1' lucid; zinit light "b4b4r07/emoji-cli"
zinit ice wait'1' lucid; zinit light "mollifier/cd-gitroot"
zinit light "Aloxaf/fzf-tab"

zinit ice wait'1' lucid; zinit light "lukechilds/zsh-better-npm-completion"

#######
# https://github.com/Aloxaf/fzf-tab
#######
enable-fzf-tab
# zstyle ':fzf-tab:*' fzf-command ftb-tmux-popup
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'exa -1 --color=always $realpath'
zstyle ':fzf-tab:*' fzf-bindings 'ctrl-j:accept' 'ctrl-a:toggle-all' 'ctrl-space:toggle+down'
# disable sort when completing `git checkout`
zstyle ':completion:*:git-checkout:*' sort false
# set descriptions format to enable group support
zstyle ':completion:*:descriptions' format '[%d]'
# set list-colors to enable filename colorizing
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
# preview directory's content with exa when completing cd
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'exa -1 --color=always $realpath'
# switch group using `,` and `.`
zstyle ':fzf-tab:*' switch-group ',' '.'
```

`End of Zinit's installer chunk` までは、インストーラが追記した部分。

### プラグインのダウンロード、有効化

```shell
zinit ice wait'1' lucid
zinit light "zdharma/fast-syntax-highlighting"

zinit load "zdharma/history-search-multi-word"
```

zinitには2つのプラグインロード方法がある

- `zinit load`
    - トラッキング機能を有効にする。zinit report で一覧表示ができたり、zinit unload でプラグインを無効化できるなどの利点があるが、ロードは遅くなる
- `zinit light`
    - トラッキング機能が無効になる。一覧等の機能が使えない代わりに高速

めったにトラッキング機能を使わないため、基本的に `zinit light` でロードすることにした

### zinit ice

後続の `zinit load`, `zinit light` の挙動を制御する

```shell
zinit ice wait'1' lucid pick'init.sh'
zinit light "b4b4r07/enhancd"
# zinit ice wait'1' lucid pick'init.sh'; zinit light "b4b4r07/enhancd" と同義
```

- wait
    - zshが起動したあとにプラグインを遅延ロードする秒数を指定する
- lucid
    - 遅延ロードしたときに、コンソールにロード情報が出力されるのを抑制する
- pick
    - sourceするファイルを指定する。pluginが `*.plugin.zsh` ファイルを起点にしていない場合、明示的に指定する

## 結果

2秒くらいかかっていた起動時間が0.6秒前後くらいになった。
また、zplugだと複数シェルを同時に起動すると競合して状態がおかしくるのか、同じプラグインが複数回ロードされることがまれにあったが、
こういった問題も起こらなくなった。
