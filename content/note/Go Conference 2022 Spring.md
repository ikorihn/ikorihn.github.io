---
title: Go Conference 2022 Spring
date: 2022-04-23T10:36:00+09:00
tags:
- Go
- meetup
lastmod: 2022-04-23T10:36:00+09:00
---

\#Go #meetup

https://gocon.jp/2022spring/schedule/#day_2022-04-23

資料まとめ
[Go Conference 2022 Spring参加メモ](https://blog.hozi.dev/hozi576/articles/01g19p2b2eg3dmjfzj4qg7cywp)

## 静的解析

go/ast めっちゃ便利じゃん、意外と難しくない
ファイルを読み込んでastでパースするといい感じにツリーができて、複雑度判定のコードを書いたりできる

## PHPからリプレースした

ヤプリで創業以来のPHPをGoで書き換える

「社内で導入実績があった」
やりたかったら小さいツールからでも実績作るの大事だよなー。ワイが先駆者だ

* DBが混沌としているがリプレース対象はアプリケーションのみ
  * カラムに巨大JSONを突っ込んでいるさまをchaos jsonって命名するのすき、現場は地獄
  * database/sql では、Scannerインターフェースを満たすように実装すれば、Selectしたときに実行されるので好きなパース処理がかける
  * カオスを下層レイヤに閉じ込めることができた
* 型があるのはすばらしい
* エラーの握りつぶしが減る
* 環境構築が楽
* 標準パッケージが読みやすい
* 標準パッケージをコードリーディングする会、いいね うちでもやってみてもいいのかも？

## GC

* Discordがパフォーマンスの理由からGoからRustに書き換えたけど、本当にそうなの？
* Goのバージョンが古いので、現在ではもっと改善されている
* Stop The Worldの時間にSLOが設けられていて、1ms未満
* GCのアルゴリズムは古くからあるものに改良を加えている
  * concurrent mark and sweep
* 並行処理を使っている
  * https://github.com/golang/go/blob/master/src/runtime/mgc.go

## Go で RDB に SQL でアクセスするためのライブラリ Kra の紹介

* sqlxはpanic使っていて、Goらしくない
* SQLはRDB操作の基本で避けられない
* データベースのほうがアプリケーションより長生き
* インピーダンスミスマッチは解消しがたいもの。避けようとせずしっかり向き合う
* ORMの誤用でN+1問題が発生しがち

## protoc

* コード生成をいっぱい頑張ってなんとかしてきたんだな〜ってわかる
* enumやDB関連コード、API関連コードをそれぞれ別コマンドで生成
* protoc pluginで拡張することで、proto定義からすべての自動生成が行えるようになった

## database/sqlの実装

* blank importでどうやって動いているの？
* func initで動いている
* mysqlだったら、sql.Registerをinitで呼んでいる
* globalなnowFunc変数にtime.Nowを入れて、test時に入れ替えれるようにしている
* goroutine safeな作りになっていて、同時にリクエストがきてもうまくハンドリングできる
* connection数が膨大にならないようになっている

## GoでAPI クライアントの実装

* RoundTripper
  * リトライ制御
  * キャッシュのコントロール
  * ユニットテスト時に外部通信を行わないようにする
* newRequestとdoを実装するのはあるあるパターン
* 典型パターンを紹介してくれているので大いに参考になりそうなんだけど、理解が追いつかなかったのでちゃんとみたいな
* テスト時はhttptest.Serverを立ち上げるか、RoundTripperを差し替えるか
  * httptest.Server立ち上げるほうがポピュラーなのかな？

## testingパッケージを使ったWebアプリケーションテスト（単体テストからE2Eテストまで）

BASE @budougumiさん

* リポジトリ層のテスト
  * contextは渡すよね
  * UseCase層からコネクションをもらうようにしている。実DBを使ってテストしている
  * sql-mockは、期待されたSQLが発行されるか？だけで実際にデータが取れたかどうかはわからない
  * fixtureはシンプルな形で用意
  * CI上で実行するときなどは環境変数を見てDBを立ち上げる
  * t.Cleanupでレコードを消す
  * UseCase層でトランザクション制御している。色々意見はあるかもだけど案件次第だよね
* ユースケース層のテスト
  * 実DBは使わない
  * sql.DBやtxをmockしている
  * commitやrollbackが呼ばれたかをチェックする
* httpハンドラー層のテスト
  * ユースケース層をmockして入出力見るくらい
  * httptest pkgを使った素朴なテスト
  * 入力/期待JSONをファイルにしている
* t.Helper, t.Cleanupとか、shuffleオプション便利

## Go x AWS Lambda

* 
