---
title: LocalStackを使ってSQS,Lambda,SES構成のメール配信をローカルで実行する
date: 2023-11-20T15:46:00+09:00
tags:
  - AWS
---

[serverless-offlineとそのpluginを利用し、SQS→Lambda→SESのメール送信をローカル環境で検証できるようにする｜SHIFT Group 技術ブログ](https://note.com/shift_tech/n/nf68c70d99203)
こちらの記事を参考にさせていただきましたが、こちらでは [Serverless Framework](https://www.serverless.com) を使っていますが、
自分の環境ではローカル実行時には [AWS RIE](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/images-test.html) を使ってビルドしたコンテナを使っているので、
Serverless Frameworkを使わない方法を調べました。

ちなみにserverlessをローカルで実行するのは serverless-offlineプラグイン
- [Serverless アプリケーションをローカルで開発する #AWS - Qiita](https://qiita.com/noralife/items/e36621ddd0e5b8ff4447)
- [serverless framework 第4回 serverless-offline を利用したローカル環境の作成](https://zenn.dev/naok_1207/articles/79e53a748cacd0)

## 手順

### ファイルを用意する

```
.
├── init
│  └── ready.d
│     └── ready.sh
├── my-function
│  └── main.go
├── my-function.zip
└── compose.yaml
```

```yaml:compose.yaml
version: "3.8"

services:
  localstack:
    image: public.ecr.aws/localstack/localstack:3.0
    container_name: "${LOCALSTACK_DOCKER_NAME-localstack_main}"
    ports:
      - "4566:4566"
    environment:
      - DEBUG=${DEBUG-}
      - AWS_DEFAULT_REGION=ap-northeast-1
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - ./init/ready.d:/etc/localstack/init/ready.d
      - "/var/run/docker.sock:/var/run/docker.sock"
```

```shell:init/ready.d/ready.sh
#!/bin/bash

# SQS
awslocal sqs create-queue --queue-name app-queue

# SES
awslocal ses verify-email-identity --email-address test@example.com
```

```go:main.go
package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

type Message struct {
	Message string
}

var (
	sesclient *ses.SES
)

func handler(ctx context.Context, ev events.SQSEvent) error {
	for _, record := range ev.Records {

		var message Message
		data := []byte(record.Body)
		err := json.Unmarshal(data, &message)
		if err != nil {
			return fmt.Errorf("json unmarshal error: %w", err)
		}

		_, err = sesclient.SendEmailWithContext(ctx, &ses.SendEmailInput{
			Destination: &ses.Destination{
				ToAddresses: []*string{aws.String("target@example.com")},
			},
			Message: &ses.Message{
				Body: &ses.Body{
					Text: &ses.Content{
						Data: aws.String(message.Message),
					},
				},
				Subject: &ses.Content{
					Data: aws.String("title"),
				},
			},
			Source: aws.String("test@example.com"),
		})
		if err != nil {
			return fmt.Errorf("failed to send: %w", err)
		}

	}
	return nil
}

func main() {
	awsConf := &aws.Config{}
	if localStack, ok := os.LookupEnv("LOCALSTACK_HOSTNAME"); ok {
		awsConf.Endpoint = aws.String(fmt.Sprintf("http://%s:4566", localStack))
	}
	sess := session.Must(session.NewSession(awsConf))
	sesclient = ses.New(sess)

	lambda.Start(handler)
}

```

### LocalStackを起動する

```shell
$ docker compose up -d
```

### Lambda関数をデプロイする

```shell
$ FUNCTION_NAME=my-function
# Lambda関数をデプロイ
$ GOOS=linux GOARCH=amd64 go build -tags lambda.norpc ./${FUNCTION_NAME}
$ zip ${FUNCTION_NAME}.zip ${FUNCTION_NAME}
$ awslocal lambda create-function --function-name ${FUNCTION_NAME} --runtime provided.al2 --handler bootstrap --architectures x86_64 --role arn:aws:iam::000000000000:role/${FUNCTION_NAME} --zip-file fileb://./${FUNCTION_NAME}.zip
# SQSと紐付ける
$ awslocal lambda create-event-source-mapping --function-name ${FUNCTION_NAME} --event-source-arn arn:aws:sqs:ap-northeast-1:000000000000:app-queue
```

### SQS動作確認

```shell
$ awslocal sqs list-queues
{
    "QueueUrls": [
        "http://sqs.ap-northeast-1.localhost.localstack.cloud:4566/000000000000/app-queue"
    ]
}

# SQSにメッセージをsend
$ awslocal sqs send-message --queue-url http://localhost:4566/000000000000/app-queue --message-body '{"key1": "hello"}'
```

### SES送信ログを確認する

[Commutity版ではメール送信はされない](https://docs.localstack.cloud/user-guide/aws/ses/) ため、LocalStackのAPIで送信されたデータを確認する

```shell
$ curl -Ss 'localhost:4566/_aws/ses?email=my@example.co.jp' | jq
```

### Lambda実行ログを確認する

```shell
$ awslocal logs tail /aws/lambda/my-function --follow
```

## やっていること

### 起動時hookを使ってSQSキューを作る

[[LocalStackのライフサイクルフックを利用する|LocalStackのライフサイクルフック]] を使って、LocalStack内の `/etc/localstack/init/ready.d` にスクリプトを配置することで、起動時にSQSのキューを作ったりSESのverifyをしたりする

### SQSをソースに、SESに送信するLambdaハンドラーを作成

- `events.SQSEvent` を引数に受け取って `SQSEvent.Records` をfor-loopで実行する関数を作成する
- [[LocalStack内のLambdaから同一LocalStack内のDynamoDBやSESを実行するときのEndpoint]] は `LOCALSTACK_HOSTNAME` を使用する
- ビルド、ZIPにしたのち、LocalStackにデプロイ
- LambdaとSQSのキューをマッピングする

### SQSにキューイング

ここでは [awslocal](https://github.com/localstack/awscli-local) を使っているが、 `aws --endpoint-url=localhost:4566` でも可能

これでSQSに紐付けられたLambdaが実行されて、SESのAPIがたたかれているはず
