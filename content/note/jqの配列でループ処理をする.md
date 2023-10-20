---
title: jqの配列でループ処理をする
date: 2023-01-04T17:20:00+09:00
tags:
- 2023/01/04
- jq
- shell
---


````json
[
  {
    "name": "John",
    "age": 20
  },
  {
    "name": "Alice",
    "age": 25
  },
  {
    "name": "Bob",
    "age": 14
  }
]
````

## `length` を使ってインデックスでアクセスする

````bash
json=$(cat list.json)
len=$(echo $json | jq length)
for i in $( seq 0 $(($len - 1)) ); do
  row=$(echo $json | jq .[$i])
done

````

よく、in の次にjqコマンドを書く例を見かけるが、これは良くない

````shell
for item in $(jq -c '.[]' list.json); do
  name=$(echo "$item" | jq -r '.name')
  age=$(echo "$item" | jq -r '.age')
  echo "name: $name, age: $age"
done
````

何度もjqを呼び出すのでパフォーマンスが良くない

## `while read -r` を使う

[詳細解説 jqコマンドとシェルスクリプトの正しい使い方と考え方 〜 データの流れを制するUNIX哲学流シェルプログラミング - Qiita](https://qiita.com/ko1nksm/items/55a86f95fdf790f863cc)

````shell
TAB=$(printf '\t')
jq -r '.[] | [.name, .age, .count] | @tsv' list.json | {
  while IFS="$TAB" read -r name age; do
    printf "name: %-10s age: %2d\n" "$name" "$age"
  done
}
````

### while文の中で変数を更新したい場合

パイプで渡すと変数が更新されないので注意
\[\[shellでwhile readの中で変数を変更しても反映されない\]

````shell
$ TAB=$(printf '\t')
$ children=0
$ while IFS="$TAB" read -r name age; do
  printf "name: %-10s age: %2d\n" "$name" "$age"
  if [[ $age -lt 18 ]]; then
    children=$((children+1))
  fi
done < <(jq -r '.[] | [.name, .age] | @tsv' list.json)
$ echo $children
1
````
