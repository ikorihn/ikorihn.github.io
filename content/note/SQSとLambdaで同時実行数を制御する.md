---
title: SQSとLambdaで同時実行数を制御する
date: 2021-10-24T22:27:56+09:00
tags:
- AWS
- Lambda
---

[AWS Lambda](note/AWS%20Lambda.md) の同時実行数の上限は、同一アカウントの同一Region内で1000件まで。

同時実行数に達すると、それ以上の呼び出しはスロットリングされ実行されない。

LamdbaのトリガーとしてSQSを設定した場合の挙動について整理する。

[AWS SQS + Lambdaの同時実行数の挙動について](https://blog.nijohando.jp/post/2020/sqs-lambda-throttling-error/)

[SQSとLambdaで実装する直列処理 | DevelopersIO](https://dev.classmethod.jp/articles/lambda-serial-processing-by-sqs/)

* Lambda Functionの予約された同時実行数を `1`に制限する
* Lambda FunctionのトリガーとしてSQSを指定する
* SQSをFIFOキューにする

例えば、バッチサイズが`3`でキューに`50個`データが有る場合、Lambdaが 17個並列で起動します。
予約された同時実行数を`1`にしないと、Lambdaが複数起動されてしまい直列に処理ができなくなります。

[SQS + Lambdaをやってみた - Qiita](https://qiita.com/aosho235/items/7df0b2316bb45f3297ce)

* Lambda関数に同時実行数が設定してある場合は、ちゃんとその数を保ったまま、すべてのメッセージが順次処理される

[New for AWS Lambda – SQS FIFO as an event source | AWS Compute Blog](https://aws.amazon.com/jp/blogs/compute/new-for-aws-lambda-sqs-fifo-as-an-event-source/)

 > 
 > In SQS FIFO queues, using more than one *MessageGroupId* enables Lambda to scale up and process more items in the queue using a greater concurrency limit.
 > Total concurrency is equal to or less than the number of unique *MessageGroupIds* in the SQS FIFO queue.
 > Learn more about [AWS Lambda Function Scaling](https://docs.aws.amazon.com/lambda/latest/dg/scaling.html) and how it applies to your event source.

* FIFOキューの場合、MessageGroupIdの数だけ並列で実行される
