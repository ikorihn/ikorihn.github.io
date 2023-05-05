---
title: shell script テキストファイルやJSONでfor loopするパターン
date: 2023-05-05T20:36:00+09:00
tags:
- shell
---

## ファイルを読み込んで一行ずつ処理する

name_list.txt

````txt
John
Bob
Alice
````

````bash
while read -r line || [ -n "$line" ]
do
  echo "name: ${line}"
done < name_list.txt ```

## JSONの配列を一つずつ処理する

[jqの配列でループ処理をする](note/jqの配列でループ処理をする.md)
````
