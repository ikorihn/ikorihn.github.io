---
title: sqlでsum_case_whenを使って場合分け集計
date: "2021-06-14T10:58:00+09:00"
tags: 
---

#sql


```sql
SELECT SUM(CASE WHEN flag = 1 THEN 1 ELSE 0 END) FROM table
```

### 件数を集計したい場合

```sql
SELECT api_path
    ,sum(case when status_code = 200 then 1 else 0 end) as success
    ,sum(case when status_code = 500 then 1 else 0 end) as error
FROM access_log
GROUP BY api_path
ORDER BY api_path
```

### 条件に応じてカラムを集計したい場合


```sql
CREATE TABLE `売上` (
  `id`             int           NOT NULL AUTO_INCREMENT,
  `プロジェクトID` varchar(3)    NOT NULL,
  `計上年月日`     date          NOT NULL,
  `金額`           decimal(11,2) NOT NULL,
  PRIMARY KEY(`id`)
);
```

```sql
SELECT
  `プロジェクトID`,
  SUM(`金額`) AS `売上額`,
  SUM(CASE WHEN `計上年月日` > '2020-07-20' THEN `金額` ELSE 0 END) AS `売上残`
FROM `売上予定`
GROUP BY `プロジェクトID`;
```

結果

```tsv
プロジェクトID    売上額       売上残
001             600000.00   200000.00
002             100000.00   0.00
```
