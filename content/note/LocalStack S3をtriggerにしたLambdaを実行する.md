---
title: LocalStack S3をtriggerにしたLambdaを実行する
date: 2024-03-04T18:13:00+09:00
tags:
  - AWS
  - Lambda
---
 

[[S3]] をトリガーにした [[AWS Lambda]] を実行するには、コンソール上であればポチポチしていくだけで設定できる。
[[AmazonSQS|SQS]] をトリガーにする場合も `aws lambda create-event-source-mapping` で簡単にマッピングできるが、S3の場合はコマンドが異なる。


### Lambdaを作成

```shell
$ zip app.zip app.py
$ awslocal lambda create-function --function-name my-function --runtime python3.12 --handler app.handler --role arn:aws:iam::000000000000:role/my-app --zip-file fileb://app.zip
```

### S3 バケットを作成

```shell
$ awslocal s3 mb s3://my-bucket
```

### S3をトリガーに設定

```shell
$ awslocal s3api put-bucket-notification-configuration --bucket my-bucket --notification-configuration '{"LambdaFunctionConfigurations":[{"LambdaFunctionArn":"arn:aws:lambda:ap-northeast-1:000000000000:function:my-function","Events":["s3:ObjectCreated:Put"]}]}'
```


### 動作確認

ファイルを置く

```shell
$ awslocal s3 cp ./test.csv s3://my-bucket/
```

ログを確認(いろいろ方法はありそうだが、ここではlogsコマンドで)

```shell
$ awslocal logs tail --follow /aws/lambda/my-function
2024-03-04T09:24:35.635000+00:00 2024/03/04/[$LATEST]7d585026f97c54261c44b1fe27b75a54 START RequestId: dd60a815-1ecf-4dc9-aac4-41f0e516f80d Version: $LATEST
2024-03-04T09:24:35.646000+00:00 2024/03/04/[$LATEST]7d585026f97c54261c44b1fe27b75a54 END RequestId: dd60a815-1ecf-4dc9-aac4-41f0e516f80d
2024-03-04T09:24:35.652000+00:00 2024/03/04/[$LATEST]7d585026f97c54261c44b1fe27b75a54 REPORT RequestId: dd60a815-1ecf-4dc9-aac4-41f0e516f80d    Duration: 44.10 ms Billed Duration: 45 ms   Memory Size: 128 MB     Max Memory Used: 128 MB

```