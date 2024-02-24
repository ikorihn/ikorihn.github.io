---
title: Docker compose ほかで作成ずみのネットワークに対して接続する
date: 2023-11-21T17:30:00+09:00
tags:
  - Docker
---

{{< card-link "https://docs.docker.jp/compose/networking.html" >}}

[[DynamoDB localをDocker composeで実行してデータ投入までする|DynamoDB local]] が立っている状態で、別のプロセスでdocker composeを実行してDynamoDBにアクセスしたいときは、既存のネットワークに対して接続するよう設定することができる。

## 手順

### 接続される側のDocker networkを作成

この場合はDynamoDB Localのネットワーク名称を設定

```yaml
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

networks:
  dynamodb-local:
    name: dynamodb_local
```

### 接続する側で既存のnetworkを利用するよう設定する

接続する側のnetworksに `external` を設定する

```yaml
version: "3.8"
services:
  app:
    image: my/app
    networks:
      - dynamodb-external

networks:
  dynamodb-external:
    name: dynamodb_local
    external: true
```
