---
title: Go sql.DB にOpenTelemetryのSpanを追加する
date: 2024-05-27T16:52:00+09:00
aliases:
  - Go sql.DB にOpenTelemetryのSpanを追加する
---


[Getting started with otelsql, the OpenTelemetry instrumentation for Go SQL | OpenTelemetry](https://opentelemetry.io/blog/2024/getting-started-with-otelsql/)

### driverをラップする系

- [GitHub - nhatthm/otelsql: OpenTelemetry SQL database driver wrapper for Go](https://github.com/nhatthm/otelsql)

sqlx などのラッパーライブラリと組み合わせることも簡単。
```go
package main

import (
	_ "github.com/lib/pq"
	"github.com/jmoiron/sqlx"
	semconv "go.opentelemetry.io/otel/semconv/v1.27.0"
	"go.nhat.io/otelsql"
)

func main(){
    // ...
	driverName, err := otelsql.Register("mysql",
		otelsql.AllowRoot(),
		otelsql.TraceQueryWithoutArgs(),
		otelsql.TraceRowsClose(),
		otelsql.TraceRowsAffected(),
		otelsql.WithDatabaseName(dbname),     // Optional.
		otelsql.WithSystem(semconv.DBSystemMySQL), // Optional.
	)
	if err != nil {
		panic(err)
	}
	sqlxDb, err := sqlx.Open(driverName, dsn)
	if err != nil {
		panic(err)
	}
    // ...
}

```

### sql.Openを置き換える系

- [GitHub - XSAM/otelsql: OpenTelemetry instrumentation for database/sql](https://github.com/XSAM/otelsql)
- [GitHub - uptrace/opentelemetry-go-extra: OpenTelemetry instrumentations for Go](https://github.com/uptrace/opentelemetry-go-extra)
    - go getするときに各DBライブラリに適した otelsql, otelsqlx, otelgorm を選択する

こちらも修正は容易で、 `sql.Open` を `otelsql.Open` に変えるだけである

```go
// github.com/XSAM/otelsql の場合
db, err := otelsql.Open("mysql", mysqlDSN, otelsql.WithAttributes(
	semconv.DBSystemMySQL,
))
if err != nil {
	panic(err)
}
defer db.Close()

// metricsを収集したい場合
err = otelsql.RegisterDBStatsMetrics(db, otelsql.WithAttributes(
	semconv.DBSystemMySQL,
))
if err != nil {
	panic(err)
}

sqlxDb := sqlx.NewDb(sqlDb, "mysql")
```

```go
// github.com/uptrace/opentelemetry-go-extra/otelsqlx の場合
db, err := otelsqlx.Open("mysql", mysqlDSN,
    otelsql.WithAttributes(semconv.DBSystemMySQL),
    otelsql.WithDBName("mydb"),
)
if err != nil {
	panic(err)
}
defer db.Close()
```