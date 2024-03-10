---
title: SQS,Lambda構成をローカルで実行する
date: 2023-11-20T15:46:00+09:00
tags:
  - AWS
---

[[LocalStack]]に[[AWS Lambda|Lambda]]と[[AmazonSQS|SQS]]をデプロイしてみる。

今回使用するLambda Function(Python)

```python:app.py
def lambda_handler(event, context):
    for record in event['Records']:
        print(record['body'])
```

## LocalStack向けのsam localを実行する手順

けっこう長いことLambdaを使ってきていて知らなかったんだけど、 [[SAM|sam local]] コマンドを [[LocalStack]] 向けにラップした [localstack/aws-sam-cli-local: Simple wrapper around AWS SAM CLI for use with LocalStack](https://github.com/localstack/aws-sam-cli-local) があり、LocalStackにデプロイしたりinvokeしたりができる。

合わせて [localstack/awscli-local: 💲 "awslocal" - Thin wrapper around the "aws" command line interface for use with LocalStack](https://github.com/localstack/awscli-local) も入れておこう。

[[LocalStack]] 用の[[Docker compose]]ファイルを作成する

```yaml:compose.yaml
version: "3.8"

services:
  localstack:
    container_name: "${LOCALSTACK_DOCKER_NAME-localstack_main}"
    image: localstack/localstack
    ports:
      - "127.0.0.1:4566:4566"            # LocalStack Gateway
    environment:
      - DEBUG=${DEBUG-}
      - AWS_DEFAULT_REGION=ap-northeast-1
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
```

sam用のtemplate.yaml

```yaml:template.yaml
AMyQueueMyQueueWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31

Resources:
  Function:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-function
      CodeUri: app/
      Handler: app.lambda_handler
      Runtime: python3.9
      Architectures:
        - arm64
      Events:
        SqsEvent:
          Type: SQS
          Properties:
            Queue: arn:aws:sqs:ap-northeast-1:000000000000:my-queue
```

デプロイしてみる
```shell
$ samlocal build
$ samlocal deploy --guided
(いろいろパラメータを入力する)
```

これでデプロイできたはず。

## aws lambda create-functionでアップロードする手順

これのためにsam localを入れるのはどうかと思ったので、aws cliだけでもできないかを検討してみた。

まずtemplate.yamlで作っていたqueueをLocalStackの起動時処理で作るようにする

```yaml:compose.yaml
version: "3.8"

services:
  localstack:
    container_name: "${LOCALSTACK_DOCKER_NAME-localstack_main}"
    image: localstack/localstack
    ports:
      - "127.0.0.1:4566:4566"            # LocalStack Gateway
    environment:
      - DEBUG=${DEBUG-}
      - AWS_DEFAULT_REGION=ap-northeast-1
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - ./init/ready.d:/etc/localstack/init/ready.d
      - "/var/run/docker.sock:/var/run/docker.sock"
```

[ライフサイクルフック](note/LocalStack.md)でqueueを作る

```sh:ready.sh
#!/bin/bash

awslocal sqs create-queue --queue-name my-queue
```

Lambda Functionを作成する

```shell
$ zip app app.py
$ awslocal lambda create-function --function-name my-app --runtime python3.9 --role arn:aws:iam::000000000000:role/my-app --handler app.lambda_handler --zip-file fileb://app.zip
# 起動後に、作成済みの関数を更新したい場合はこちら
$ awslocal lambda update-function-code --function-name my-app --zip-file fileb://app.zip

# 作成or更新する関数を作っちゃうのもあり
function create_or_update_lambda_function() {
  FUNCTION_NAME=$1

  if ! awslocal lambda create-function --function-name my-app --runtime python3.9 --role arn:aws:iam::000000000000:role/my-app --handler app.lambda_handler --zip-file fileb://app.zip; then
    awslocal lambda update-function-code --function-name my-app --zip-file fileb://app.zip
  fi
}

# SQSと紐付ける
$ if [[ "$(awslocal lambda list-event-source-mappings --query "EventSourceMappings[?contains(EventSourceArn, 'my-queue')]")" == "[]" ]]; then
    awslocal lambda create-event-source-mapping --function-name my-app --event-source-arn arn:aws:sqs:ap-northeast-1:000000000000:my-queue
fi
```

## 動作確認

```shell
$ awslocal sqs send-message --queue-url http://localhost:4566/000000000000/my-queue --message-body '{ "my-key": "my-value" }'

# ログを確認
$ function_name=my-app
$ awslocal logs get-log-events --log-group-name /aws/lambda/${function_name} --log-stream-name $(awslocal logs describe-log-streams --log-group-name /aws/lambda/${function_name} | jq -r '.logStreams[0].logStreamName')
```

## 参考にさせていただいた記事

- [LocalStack と samlocal コマンドで SQS x Lambda 構成をローカル環境で実行する - kakakakakku blog](https://kakakakakku.hatenablog.com/entry/2023/04/27/091435)
