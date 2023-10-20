---
title: zshでpathの重複を除外する
date: 2021-10-29T17:32:00+09:00
tags:
- zsh
---

<https://tech.serhatteker.com/post/2019-12/remove-duplicates-in-path-zsh/>

````bash
typeset -U path
````

That’s all.

As you can imagine `-U` stands for ‘unique’. From [doc](https://github.com/antonio/zsh-config/blob/master/help/typeset):

````txt
-U     For  arrays  (but not for associative arrays), keep only the
       first occurrence of each duplicated value.  This may also be
       set for colon-separated special parameters like PATH or FIG‐
       NORE, etc.  This flag has a different meaning when used with
````

Btw. just care it is not `-u`. This flag just converts the content to uppercase.
