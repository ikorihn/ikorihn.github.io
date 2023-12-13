---
title: zeno.zshを入れてみる
date: 2023-11-14T00:00:00+09:00
tags:
- zsh
- terminal
---

{{< card-link "https://github.com/yuki-yano/zeno.zsh" >}}

[zsh](note/zsh.md) でabbrの機能と、任意のコマンドにfzfによる補完を追加できるプラグイン。
[Deno](note/Deno.md) で動いていて、 [TypeScript](note/TypeScript.md) で書かれているので、[shell script](note/shell%20script.md)と比べてソースも読みやすい。

[zsh-abbr](note/zsh-abbr.md)と https://github.com/mnowotnik/fzshell の複合のようなものだとおもった。
設定もしやすそうなのでこちらに一本化してみる。

## インストール

[sheldon](note/sheldon.md) で追加

````toml
[plugins.zeno]
github = "yuki-yano/zeno.zsh"
````

`~/.config/zeno/config.yml` をおいてみたが `mode is not exist` といったエラーが出て使えなかった。。

=> denoがPATHに追加される前にzenoをロードしていたのが原因だった。ロード順を調整したら動いた

````yaml:config.yml
snippets:
  # snippet and keyword abbrev
  - name: git status
    keyword: gs
    snippet: git status
  # snippet with placeholder
  - name: git commit message
    keyword: gcim
    snippet: git commit -m '{{commit_message}}'
  - name: git commit
    keyword: gcia
    snippet: git commit --amen
  - name: git diff
    keyword: gdim
    snippet: git diff --name-status origin/master
  - name: git pull
    keyword: gpl
    snippet: git pull --rebase --autostash
  - name: git rebase
    keyword: greb
    snippet: git rebase origin/master
  - name: git reset
    keyword: grese
    snippet: git reset HEAD\^
  - name: git restore
    keyword: gres
    snippet: git restore .
  - name: git stash
    keyword: gsta
    snippet: git stash
  - name: git stash poop
    keyword: gstap
    snippet: git stash pop
  - name: git stash poop
    keyword: gsw
    snippet: git switch -c feature/

  - name: "null"
    keyword: "null"
    snippet: ">/dev/null 2>&1"
    # auto expand condition
    # If not defined, it is only valid at the beginning of a line.
    context:
      # buffer: ''
      lbuffer: '.+\s'
      # rbuffer: ''

  - name: branch
    keyword: B
    snippet: git symbolic-ref --short HEAD
    context:
      lbuffer: '^git\s+checkout\s+'
    evaluate: true # eval snippet

  - name: vim diff
    keyword: vimdiff
    snippet: nvim -d
  - name: stdout and pbcopy
    keyword: teee
    snippet: tee >(pbcopy)
    context:
      # buffer: ''
      lbuffer: '.+\s'
  - name: pwd with $HOME
    keyword: pwdd
    snippet: pwd | sed "s#$HOME#\$HOME#"
  - name: pbcopy without new line
    keyword: pbcopyy
    snippet: tr -d '\n' | pbcopy
    context:
      # buffer: ''
      lbuffer: '.+\s'
  - name: cd
    keyword: dc
    snippet: cd
  - name: exit
    keyword: ':q'
    snippet: exit
  - name: exit
    keyword: ':q'
    snippet: exit


completions:
````
