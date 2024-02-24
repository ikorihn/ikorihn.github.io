---
title: Go GORMでPrepareStmt trueにしたときにメモリリークが発生した
date: "2023-06-08T10:35:00+09:00"
tags:
  - '2023/06/08'
  - Go
---

パフォーマンス向上のため、PrepareStmtをtrueにした。

https://gorm.io/docs/performance.html#Caches-Prepared-Statement

これは標準パッケージの `PrepareContext` の実行結果の `sql.Stmt` をキャッシュしておいて、2回目以降の実行を速くする。

https://github.com/go-gorm/gorm/blob/206613868439c5ee7e62e116a46503eddf55a548/prepare_stmt.go#L68

これを有効にしたときにメモリリークが発生するようになったため、原因を調べた。

## 再現方法

以下のようなSQLを実行していた。

```go
gormDb, err := gorm.Open("mydb", &gorm.Config{
    PrepareStmt: true,
})
if err != nil {
    return nil, err
}

// weightは関数の引数と想定。ほぼ被ることのないバラバラの値とする
gormDb.Order(fmt.Sprintf("(ranking * %s) asc", weight)).First(&result)
```

これの問題点は、 `weight` の値ごとに異なるSQLが発行されることだった。
PrepareStmt: true のとき、GORMの実装では発行されたSQL文をキーにmap型の値にキャッシュされるため、 `weight` の値がばらつくほどキャッシュされる量も増える。
これによってメモリリークが発生していた。

## 解決方法

解決方法は、ちゃんとprepared statementにすることだ。

```go
gormDb.Clauses(clause.OrderBy{
	Expression: clause.Expr{
		SQL: "(ranking * ?) asc",
		Vars: []any{
			weight,
		},
	},
}).Limit(1).Find(&tpoint)
```

- 単純なOrderには指定ができなかったので、clauseを使って生SQLを書く
- `First` を指定すると `ORDER BY <primary key>` で上書きされてしまったため、 `Limit(1).Find` にした
