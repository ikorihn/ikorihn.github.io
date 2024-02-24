---
title: shell script 偶数行と奇数行で別の処理をする
date: "2023-08-10T15:04:00+09:00"
tags:
  - '2023/08/10'
  - shell
lastmod: '2023-08-10T15:04:30+09:00'
---


```shell
FILE=keyvalues.txt
index=1
while read -r line; do
  if [[ $(expr index%2) -ne 0 ]]; then
    key=$line
  else
    val=$line
    echo "$key = $value"
  fi

  (( index++ ))
done < $FILE
```
