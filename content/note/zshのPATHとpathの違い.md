---
title: zshのPATHとpathの違い
date: '2021-08-13T11:49:00+09:00'
tags:
  - 'zsh'
---

[[zsh]] で、PATHを追加するときに大文字のPATHと小文字のpathとで挙動が違った

<https://unix.stackexchange.com/questions/532148/what-is-the-difference-between-path-and-path-lowercase-versus-uppercase-with>

`$PATH` はstringで、`$path` は `$PATH` に紐付けられた配列ということらしい

```shell
$ echo $PATH
/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

$ echo $path
/opt/homebrew/bin /opt/homebrew/sbin /usr/local/bin /usr/bin /bin /usr/sbin /sbin

$ typeset -p path
typeset -aT PATH path=( /opt/homebrew/bin /opt/homebrew/sbin /usr/local/bin /usr/bin /bin /usr/sbin /sbin)
```
