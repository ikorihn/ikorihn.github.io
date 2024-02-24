---
title: Awsのサービスを使ってバッチ処理する
date: "2021-06-17T20:43:00+09:00"
lastmod: '2021-06-23T15:21:19+09:00'
tags:
  - 'AWS'
---

[[AmazonSQS]], [[AWS Lambda]], [[AmazonSNS]] を使ってバッチ処理によるPUSH送信を実現する

-   [AWSでバッチ処理を実装する際の選択肢とサービス比較](https://zenn.dev/faycute/articles/fb310e3ccd783f)
-   [[レポート] SNSとSQSとLambdaによるスケーラブルでサーバーレスなイベント駆動アーキテクチャ \#reinvent \#svs303 | DevelopersIO](https://dev.classmethod.jp/articles/reinvent2020-svs303-scalable-serverless-event-driven-architectures-with-sns-sqs-lambda/)
-   [SQSトリガーを使って15分ごとに繰り返し実行する運用ジョブを作成する – サーバーワークス サポートセンター](https://support.serverworks.co.jp/hc/ja/articles/360009321134-SQSトリガーを使って15分ごとに繰り返し実行する運用ジョブを作成する)
-   [【AWS】lambdaとSQSを利用してバッチ処理が可能か試してみました | eyeon -アイオン-](https://www.k-friendly.com/541)
-   [Amazon SNSでプッシュ通知を送るための基礎知識 | UNITRUST](https://www.unitrust.co.jp/6182)

## SQSを遅延実行する

<https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html>
<https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-message-timers.html>
