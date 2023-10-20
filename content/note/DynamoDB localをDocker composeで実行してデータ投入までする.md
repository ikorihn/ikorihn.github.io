---
title: DynamoDB localをDocker composeで実行してデータ投入までする
date: 2023-09-13T19:15:00+09:00
tags:
- DynamoDB
- Docker
---

## 概要

DynamoDBを使うアプリケーション開発で、テストを簡単にするためにDynamoDBをローカルに立てたいと思います。

AWS公式が紹介しているDynamoDB Localを使います。

{{< card-link "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html" >}}

## Dockerで実行する

こちらのイメージを使用する
https://hub.docker.com/r/amazon/dynamodb-local 

````shell
docker run -p 8000:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb
````

これで起動する。
aws cliでendpoint-urlを指定して操作できる。

````shell
aws dynamodb --endpoint-url http://localhost:8000 list-tables
````

## データを入れる

aws cliコンテナをDynamoDB Localと同じネットワークで起動して、テーブル作成やデータ投入のコマンドを実行する

````shell
$ docker run --rm --network=dynamodb-local -it public.ecr.aws/aws-cli/aws-cli:latest bash
````

````json:items.json
{
    "Title": {"S": "Call Me Today"},
    "Year": {"S": "2022"}
}
````

````shell
# region, endpoint urlは環境変数AWS_REGION, AWS_ENDPOINT_URLでも設定できる
$ aws dynamodb --region ap-northeast-1 --endpoint-url http://dynamodb-local:8000 create-table --table-name MusicCollection --attribute-definitions AttributeName=Title,AttributeType=S --key-schema AttributeName=Title,KeyType=HASH 
$ aws dynamodb --region ap-northeast-1 --endpoint-url http://dynamodb-local:8000 put-item --table-name MusicCollection --item file://items.json
````

## Docker Compose で起動とデータ投入を行う

DynamoDB Localのコンテナと、データを投入するコンテナを起動するcompose.yamlを作成する。

````yaml:compose.yaml
version: "3.8"
services:
  dynamodb-local:
    command: -jar DynamoDBLocal.jar -sharedDb
    image: amazon/dynamodb-local:latest
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    networks:
      - dynamodb-local
  setup:
    depends_on:
      - dynamodb-local
    build:
      context: .
      dockerfile: setup.Dockerfile
    environment:
      - AWS_ENDPOINT_URL=http://dynamodb-local:8000
    command: ['./setup.sh']
    networks:
      - dynamodb-local

networks:
  dynamodb-local:
    name: dynamodb-local
````

````Dockerfile:setup.Dockerfile
FROM public.ecr.aws/aws-cli/aws-cli:latest

ENV AWS_REGION=ap-northeast-1
ENV AWS_ACCESS_KEY_ID=dummy
ENV AWS_SECRET_ACCESS_KEY=dummy

COPY setup.sh data.csv ./

ENTRYPOINT []
````

````shell:setup.sh
#!/bin/bash

DIR=$(cd $(dirname $0); pwd)

aws dynamodb create-table --table-name MusicCollection --attribute-definitions AttributeName=Title,AttributeType=S --key-schema AttributeName=Title,KeyType=HASH 
aws dynamodb put-item --table-name MusicCollection --item file://items.json
````
