---
title: zshでhomebrewで入れたaws-cli-v2の補完を効かせる
date: 2021-08-22T11:55:00+09:00
tags:
- zsh
- aws
---

<https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-completion.html>

````shell:~/.zshrc
# AWS CLI v2
autoload bashcompinit && bashcompinit
autoload -Uz compinit && compinit
compinit
complete -C aws_completer aws
````
