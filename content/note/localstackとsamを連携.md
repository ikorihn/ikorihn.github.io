---
title: localstackとsamを連携
date: 2021-08-19T23:18:00+09:00
lastmod: 2021-08-22T11:38:07+09:00
tags:
- AWS
- sam
---

\#AWS #sam

## 事象

[SAM](note/SAM.md) コマンドで実行したLambdaから、 [LocalStack](note/LocalStack.md) で立てたS3にアクセスできない

## TL;DR

macの場合、Lambdaから接続するhostを `localstack` ではなく `host.docker.internal` にする

<https://github.com/localstack/localstack/issues/878>

## 実装

````yml:docker-compose.yml
version: "3.8"

services:
  localstack:
    container_name: "${LOCALSTACK_DOCKER_NAME-localstack_main}"
    image: localstack/localstack
    network_mode: bridge
    ports:
      - "127.0.0.1:53:53"
      - "127.0.0.1:53:53/udp"
      - "127.0.0.1:443:443"
      - "127.0.0.1:4566:4566"
      - "127.0.0.1:4571:4571"
    environment:
      - SERVICES=s3
      - DEBUG=${DEBUG- }
      - DATA_DIR=/tmp/localstack/data
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DEFAULT_REGION=ap-northeast-1
    volumes:
      - "./work:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
````

````go:main.go
package main

import (
	"context"
	"io/ioutil"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func handler(event events.CloudWatchEvent) (string, error) {
	cfg, _ := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("dummy", "dummy", "dummy")),
	)

    // localstack S3のURL
    er := awsS3.EndpointResolverFromURL("http://host.docker.internal:4566")
	client := s3.NewFromConfig(cfg,
		s3.WithEndpointResolver(er),
        // localstack S3の場合、virtual hostでのアクセスができないためpath styleを使う
		func(o *s3.Options) {
			o.UsePathStyle = true
		},
	)

	input := &s3.GetObjectInput{
		Bucket: aws.String("sample-bucket"),
		Key:    aws.String("path/to/file"),
	}

	output, err := client.GetObject(context.TODO(), input)
	if err != nil {
		return "", err
	}

	defer output.Body.Close()
	b, err := ioutil.ReadAll(output.Body)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func main() {
	lambda.Start(handler)
}
````

## 参考

[AWS SAM CLI と localstack を利用して Lambda をローカル実行してみよう](https://bsblog.casareal.co.jp/archives/5571)
[AWS SAM Local と LocalStack を使って ローカルでAWS Lambdaのコードを動かす | DevelopersIO](https://dev.classmethod.jp/articles/sam-local-with-localstack/)
