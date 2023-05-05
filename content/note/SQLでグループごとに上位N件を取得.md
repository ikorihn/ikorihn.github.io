---
title: SQLでグループごとに上位N件を取得
date: 2021-06-15T13:16:00+09:00
lastmod: 2021-06-15T13:17:00+09:00
tags:
- sql
---

\#sql

あるグループごとに上位〇件ずつデータを取得して比較したいという際にwindow関数を使う。

### テーブル

sales_t

|category|product|sales|
|--------|-------|-----|
|食品|りんご|30|
|食品|みかん|20|
|食品|バナナ|10|
|筆記用具|ペン|40|
|筆記用具|消しゴム|10|
|筆記用具|赤ペン|30|

### categoryごとに上位2件ずつ取得する

````sql
select * from (
    select category
        , product
        , row_number() over (partition by category order by sales desc) as row
    from sales_t
)
where row <= 2;
````

### 件数の多いものから取得する

````sql
select * from (
    select category
        , product
        , count(*) as cnt
        , row_number() over (partition by category order by count(*) desc) as row
    from sales_t
)
where row <= 2;
````
