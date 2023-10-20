---
title: AmazonSQS
date: 2021-06-28T10:26:00+09:00
lastmod: 2021-06-28T10:27:11+09:00
tags:
- AWS
---

\#AWS

# Amazon Simple Queue Service (Amazon SQS)

<https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>

フルマネージドのキューサービス

キューを使った非同期処理の実現

## 標準キューとFIFOキュー

[AWS — Difference between SQS Standard and FIFO Queues | by Ashish Patel | Awesome Cloud | Medium](https://medium.com/awesome-cloud/aws-difference-between-sqs-standard-and-fifo-first-in-first-out-queues-28d1ea5e153)

 > 
 > FIFO queues have essentially the same features as standard queues, but provide the added benefits of supporting ordering and exactly-once processing and ensure that the order in which messages are sent and received is strictly preserved.

* 標準キュー
  * スループットが高い
  * At-Least-Once Delivery: 一回の実行が保証される。ただし、複数回実行される可能性がある
  * Best effort ordering
  * 120,000件まで
* FIFOキュー
  * 先入れ先出し
  * Exactly-Once Delivery
  * Limited Throughput
  * 20,000件まで

キューの処理が以下の場合は標準キューを採用、それ以外はFIFOキューを採用

* 順序性に依存しない
* 処理の重複を許容できる

## メッセージ

サイズ上限は256KBまで

## 遅延キュー

https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html

キューへの新しいメッセージを0~900秒遅延できる
遅延時間の間、コンシューマには表示されなくなる

メッセージ個別の `DelaySeconds` も設定できるが、FIFOキューでは使用不可

## 用語

### 可視性タイムアウト

設定した期間、重複したメッセージ配信が行われないようにする機能
ベストプラクティスとして、後続処理時間+アルファを設定すると良い

### ショートポーリングとロングポーリング

キューからのメッセージ取得(サブスクライブ)の際、対象のキューがない場合、
一定時間キューに新規登録されるメッセージを待機かどうかの機能

待機を行うことをロングポーリング、待機を行ないことをショートポーリングと言う
「メッセージ受信待機時間」にて設定

### デットレターキュー

バグったデータを別キューに格納する機能
Cloudwatchと連携し、デバッグに使用できる。
「最大受信数」にて設定したメッセージを受信数後、デッドレターキューに移動される
※最大メッセージサイズ：値は 1～256 KB の間である必要があります
