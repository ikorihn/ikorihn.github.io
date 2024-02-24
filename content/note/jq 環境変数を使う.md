---
title: jq 環境変数を使う
date: 2023-11-24T11:10:00+09:00
tags:
  - jq
---

[[jq]] で環境変数を使おうとして `jq ".[] | select(.name == ${NAME})"` とかしてもうまくいかない。

## フィルタまるごと変数にする

```shell
$ name=foo
$ expression=".[] | select(.name == \"${name}\")"
$ jq "${expression}" example.json
```

## `--arg` を使う

[jq Manual (development version)](https://stedolan.github.io/jq/manual/#Invokingjq)
[Add a field to an object with JQ · GitHub](https://gist.github.com/joar/776b7d176196592ed5d8)

```shell
$ env_name=foo
$ jq --arg name ${env_name} '.[] | select(.name == $name)' example.json
```

- `--arg expression内で使う変数名 値` の順番
- expression内では `"${name}"` ではなく `$name` とする必要がある
