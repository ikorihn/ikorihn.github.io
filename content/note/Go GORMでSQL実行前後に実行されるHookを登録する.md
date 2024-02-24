---
title: Go GORMでSQL実行前後に実行されるHookを登録する
date: "2023-05-19T17:54:00+09:00"
tags:
  - '2023/05/19'
  - Go
---

## 構造体単位で適用する



## gorm.DB全体に適用する

[Plugin](https://gorm.io/docs/write_plugins.html) を使ってGlobalに設定することも可能

定義済みのcallbackはこちら
https://github.com/go-gorm/gorm/blob/master/callbacks/callbacks.go

`Query()` に対して `gorm:query` という名前で定義済みなので、それのあとに実行するPluginは以下のように書ける

```go
gormDb.Callback().Query().After("gorm:query").Register("custom_after_query", func(tx *gorm.DB) {
    fmt.Printf("sql ==> %v, var ==> %v\n", tx.Statement.SQL.String(), tx.Statement.Vars)
})
  ```

各pluginの動きを見るために以下のように書いた

```go
func NewDB(dialector gorm.Dialector) (*gorm.DB, error) {
	gormDb, err := gorm.Open(dialector, &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})
	if err != nil {
		return nil, err
	}

	{
		t := "query"
		gormDb.Callback().Query().Before("gorm:"+t).Register("before_"+t, func(tx *gorm.DB) {
			fmt.Println("before_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
		gormDb.Callback().Query().After("gorm:"+t).Register("after_"+t, func(tx *gorm.DB) {
			fmt.Println("after_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
	}
	{
		t := "preload"
		gormDb.Callback().Query().Before("gorm:"+t).Register("before_"+t, func(tx *gorm.DB) {
			fmt.Println("before_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
		gormDb.Callback().Query().After("gorm:"+t).Register("after_"+t, func(tx *gorm.DB) {
			fmt.Println("after_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
	}
	{
		t := "after_query"
		gormDb.Callback().Query().Before("gorm:"+t).Register("before_"+t, func(tx *gorm.DB) {
			fmt.Println("before_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
		gormDb.Callback().Query().After("gorm:"+t).Register("after_"+t, func(tx *gorm.DB) {
			fmt.Println("after_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
	}
	{
		t := "raw"
		gormDb.Callback().Raw().Before("gorm:"+t).Register("before_"+t, func(tx *gorm.DB) {
			fmt.Println("before_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
		gormDb.Callback().Raw().After("gorm:"+t).Register("after_"+t, func(tx *gorm.DB) {
			fmt.Println("after_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
	}
	{
		t := "row"
		gormDb.Callback().Row().Before("gorm:"+t).Register("before_"+t, func(tx *gorm.DB) {
			fmt.Println("before_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
		gormDb.Callback().Raw().After("gorm:"+t).Register("after_"+t, func(tx *gorm.DB) {
			fmt.Println("after_"+t, "sql", tx.Statement.SQL.String(), "var", tx.Statement.Vars)
		})
	}

	return gormDb, nil
}

```
