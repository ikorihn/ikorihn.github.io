---
title: Bashデバッグ実行
date: "2021-06-24T10:27:00+09:00"
tags: 
---

https://qiita.com/mashumashu/items/ee436b770806e8b8176f

```shell
#!/bin/bash

trap 'read -p "$0($LINENO) $BASH_COMMAND"' DEBUG

echo foo
echo bar
if [ "$1" = "yes" ]; then
  echo bazz
fi
```
