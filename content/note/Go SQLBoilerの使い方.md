---
title: Go SQLBoilerの使い方
date: "2023-06-18T22:48:00+09:00"
tags: 
    - '2023/06/13'
---

{{< card-link "https://github.com/volatiletech/sqlboiler" >}}

[[Go]] のORMライブラリの一つで、特徴としてはDBに接続して、予め作成ずみのテーブルからコードを生成することができる。
よってマイグレーション機能はないのだが、自分のユースケースではその機能は使わないので便利だと思う。

コードの生成は `sqlboiler` のコマンドラインツールで行う。

生成されるコードは以下の特徴がある。

- 静的型付けされており、リフレクションを使わないので高速で、コードも追いやすい
- DBアクセスする関数はcontext.Contextを引数にとる
    - GORMの場合、 `WithContext` を忘れるとcontextが渡せず、特に初心者だと忘れがち
- テンプレートを使って生成されるコードをカスタマイズできる

## 基本的な使い方

ここにはあまり書かない。

- 接続は `database/sql` の `sql.Open`
- 参照や更新は、生成されたコードの `models.XXX` にメソッドが生えている

## Eager Loading

## バルクインサート

[SQLBoilerでBulk Insertを実現する方法 - Qiita](https://qiita.com/touyu/items/4b25fbf12804f12778b7)
https://github.com/volatiletech/sqlboiler/issues/101

## Raw SQLを書いて実行する


## TIPS

### mysqlでBOOLEAN (TINYINT(1)と等価) を数値型として扱いたい

https://github.com/volatiletech/sqlboiler/issues/80
https://github.com/volatiletech/sqlboiler/blob/4dd76363f68e73f9bd52ca984446db69a2282981/drivers/sqlboiler-mysql/driver/mysql.go#L516


## 参考資料

- [GolangのORM SQLBoilerを使ってみる - 実装編(Create/Update/Delete) - ken-aio's blog](https://ken-aio.github.io/post/2019/03/25/golang-sqlboiler-cud/)
- [SQLBoiler（とoapi-codegen）でつくるREST APIサーバ | フューチャー技術ブログ](https://future-architect.github.io/articles/20210730a/)
- [SQLBoiler の使い方を簡単にまとめた - くろのて](https://note.crohaco.net/2020/golang-sqlboiler/)
