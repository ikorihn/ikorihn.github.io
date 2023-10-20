---
title: localstackでS3をmockする
date: 2021-08-22T11:57:00+09:00
tags:
- AWS
- unittest
lastmod: 2021-08-22T11:57:54+09:00
---

[localstack](note/localstack.md) を使って [S3](note/S3.md) をモックできる

## 構築

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

````shell
docker-compose up -d
````

## localstack用のプロファイルを作成する

````shell
$ aws configure --profile localstack-push
AWS Access Key ID [****************ummy]: dummy
AWS Secret Access Key [****************ummy]: dummy
Default region name [ap-northeast-1]: ap-northeast-1
Default output format [json]: json
````

## localstackのS3にバケットを作成する

````shell
$ aws --profile localstack-push --endpoint-url=http://localhost:4566 s3 mb s3://sample-bucket
````
