---
title: ripgrepで複数行にまたがる検索
date: "2021-08-05T16:42:00+09:00"
tags: 
---

#shell 

https://til.hashrocket.com/posts/9zneks2cbv-multiline-matches-with-ripgrep-rg

```shell
$ echo 'apple\norange\nbanana\nkiwi' | rg 'orange.*kiwi'
```

=> マッチしない

```shell
$ echo 'apple\norange\nbanana\nkiwi' | rg --multiline 'orange.*kiwi'
```

=> マッチしない
`.` が `\n` にマッチしないため。

`dot all` modifier = `(?s)` をつかう

```shell
$ echo 'apple\norange\nbanana\nkiwi' | rg --multiline '(?s)orange.*kiwi'
orange
banana
kiwi
```

=> マッチする

`--multiline-dotall` でもよい

```shell
$ echo 'apple\norange\nbanana\nkiwi' | rg --multiline --multiline-dotall 'orange.*kiwi'
orange
banana
kiwi
```
