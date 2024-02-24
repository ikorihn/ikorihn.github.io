---
title: jqのクエリ内でshell変数を使う
date: "2023-01-04T17:13:00+09:00"
tags:
  - '2023/01/04'
  - 'jq'
  - 'shell'
---

文字列結合で変数を埋め込む方法がまっさきに思いつく

```shell
$ name="bob"
$ cat sample.json | jq '.content | select( .name == '$name' )'
```

よりスマートなやり方がjqのオプションである

##  `--arg` を使用する

[jq Manual (development version)](https://stedolan.github.io/jq/manual/#Invokingjq)

```shell
$ name_var="bob"
$ cat sample.json | jq --arg name $name_var '.content | select( .body == $name )'
```
