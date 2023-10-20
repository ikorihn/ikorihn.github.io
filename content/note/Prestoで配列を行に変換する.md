---
title: Prestoで配列を行に変換する
date: 2021-12-09T16:46:00+09:00
tags:
- Athena
- SQL
lastmod: 2021-12-09T17:07:11+09:00
---

## 横持ちのテーブルを縦持ちに変換する

[PrestoのUNNESTを利用した横縦変換 | 分析ノート](https://analytics-note.xyz/sql/presto-unnest-unpivot/)

横持ちのテーブル(htable)

|uid|c1|c2|c3|
|---|--|--|--|
|101|11|12|13|
|102|21|22|23|

縦持ちのテーブルに変換したい(vtable)

|uid|key|value|
|---|---|-----|
|101|c1|11|
|101|c2|12|
|101|c3|13|
|102|c1|21|
|102|c2|22|
|102|c3|23|

### UNIONを使う(シンプル)

````sql
SELECT
    uid,
    'c1' AS key,
    c1 AS value
FROM
    htable
UNION ALL SELECT
    uid,
    'c2' AS key,
    c2 AS value
FROM
    htable
UNION ALL SELECT
    uid,
    'c3' AS key,
    c3 AS value
FROM
    htable
````

カラムが増えると長くなる

### UNNESTを使う

````sql
SELECT
    uid,
    t.key,
    t.value
FROM
    htable
CROSS JOIN UNNEST (
  array['c1', 'c2', 'c3'],
  array[c1, c2, c3]
) AS t(key, value)
````

## 配列 -> レコードに変換する

|time_range|
|----------|
|\["16:00-16:30", "16:30-17:00", "17:00-17:30", "17:30-18:00", "18:00-18:30", "18:30-19:00", "19:00-19:30", "19:30-20:00", "20:00-20:30", "20:30-21:00", "21:00-21:30"\]|

````sql
SELECT time_range FROM tbl CROSS JOIN UNNEST(time_ranges) AS t(time_range)
````

=> 結果

|time_range|
|----------|
|16:00-16:30|
|16:30-17:00|
|17:00-17:30|
|17:30-18:00|
|18:00-18:30|
|18:30-19:00|
|19:00-19:30|
|19:30-20:00|
|20:00-20:30|
|20:30-21:00|
|21:00-21:30|

配列の順番も合わせて別々のレコードに変換したい場合
`WITH ORDINALITY` をつけると配列の順番を格納するカラムがUNNEST後のカラム構造の末尾に追加される

````sql
SELECT time_id, time_range FROM tbl CROSS JOIN UNNEST(time_ranges) WITH ORDINALITY AS t( time_range, time_id )
````

### 文字列から変換する

|query|
|-----|
|q=カラオケ&city=tokyo&open=true|

````sql
WITH
    t AS (
        SELECT
            split_to_map(query, '&', '=') as q
        FROM
            tbl
    )
SELECT
    q['q'] AS v1,
    q['city'] AS v2,
    q['open'] AS v3
FROM
    t
````

## 縦横変換

[PrestoのMap型を使った縦横変換 | 分析ノート](https://analytics-note.xyz/sql/presto-unnest-unpivot/)

縦持ちのテーブル(vtable)

|uid|key|value|
|---|---|-----|
|101|c1|11|
|101|c2|12|
|101|c3|13|
|102|c1|21|
|102|c2|22|
|102|c3|23|

横持ちのテーブルに変換したい(htable)

|uid|c1|c2|c3|
|---|--|--|--|
|101|11|12|13|
|102|21|22|23|

MAP_AGGを使ってkeyとvalueの対応のmapを作成して各keyの値を取り出すやり方

````sql
SELECT
    uid,
    kv['c1'] AS c1,
    kv['c2'] AS c2,
    kv['c3'] AS c3
FROM (
    SELECT
        uid,
        MAP_AGG(key, value) AS kv
    FROM
        vtable
    GROUP BY
        uid
) AS t
````

Prestoでない場合は以下のような書き方ができる

````sql
SELECT
    uid,
    MAX(
        CASE WHEN key = 'c1' THEN
            value
        ELSE
            NULL
        END
    ) AS c1,
    MAX(
        CASE WHEN key = 'c2' THEN
            value
        ELSE
            NULL
        END
    ) AS c2,
    MAX(
        CASE WHEN key = 'c3' THEN
            value
        ELSE
            NULL
        END
    ) AS c3
FROM
    vtable
GROUP BY
    uid
````
