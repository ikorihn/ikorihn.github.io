---
title: zsh fzf-tabをつかっているときにfzfでdouble starでの補完が効かない
date: 2023-05-06T15:30:00+09:00
tags:
- 2023/05/06
- zsh
- terminal
---

[fzf-tab](https://github.com/Aloxaf/fzf-tab) を入れていると、 [fzf](note/fzf.md) の `**<TAB>` によってディレクトリ配下のファイルを再帰的に表示するキーバインドが実行されなくてこまった 

## 対応方法

https://github.com/Aloxaf/fzf-tab/issues/65#issuecomment-1344970328

````shell
# fzf-tabを入れいているとFZF_COMPLETION_TRIGGERによるトリガーが効かなくなるため、ワークアラウンドとしてTAB2回で発動するようにする
fzf-completion-notrigger() {
    # disable trigger just this once
    local FZF_COMPLETION_TRIGGER=""
    # if fzf-completion can't come up with something, call fzf-tab-complete
    # instead of the default completion widget (expand-or-complete).
    #
    # FIXME: triggers an infinite recursion on an empty prompt
    # _zsh_autosuggest_highlight_reset:3: maximum nested function level reached; increase FUNCNEST?
    #
    #local fzf_default_completion='fzf-tab-complete'
    fzf-completion "$@"
}
zle -N fzf-completion-notrigger

# Set an aggressive $KEYTIMEOUT to make usage of single <Tab> less miserable
KEYTIMEOUT=20
# Bind double <Tab>
bindkey '\t\t' fzf-completion-notrigger
````
