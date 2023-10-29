---
title: DynamoDB CLIでリクエストするときのパラメータメモ
date: 2023-09-22T11:51:00+09:00
tags:
- AWS
- DynamoDB
---

AWS CLIでDynamoDBにリクエストするときにインプットのJSONを作成するのが面倒なのでメモ

[batch-get-item — AWS CLI 2.0.34 Command Reference](https://awscli.amazonaws.com/v2/documentation/api/2.0.34/reference/dynamodb/batch-get-item.html)
[DynamoDBをAWS CLIで操作してみる（アイテム操作） · TechTeco](https://techte.co/2017/04/25/dynamodb-usage-item/)

````shell
$ aws --version
aws-cli/2.13.25 Python/3.11.6 Darwin/22.6.0 source/arm64 prompt/off
````

`N` とか `S` とかのデータタイプの説明は[このドキュメント](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html)

### create-table

https://awscli.amazonaws.com/v2/documentation/api/2.0.34/reference/dynamodb/create-table.html

````shell
$ aws dynamodb create-table --request-items file://create-table.json 
````

````json
{
  "AttributeDefinitions": [
    {
      "AttributeName": "Artist",
      "AttributeType": "S"
    },
    {
      "AttributeName": "SongTitle",
      "AttributeType": "S"
    }
  ],
  "ProvisionedThroughput": {
    "WriteCapacityUnits": 5,
    "ReadCapacityUnits": 5
  },
  "TableName": "MusicCollection",
  "KeySchema": [
    {
      "KeyType": "HASH",
      "AttributeName": "Artist"
    },
    {
      "KeyType": "RANGE",
      "AttributeName": "SongTitle"
    }
  ]
}
````

### get-item

````shell
$ aws dynamodb get-item --table-name MusicCollection --keys file://get-item.json 
````

````json
{
  "<KEY1>": {
    "S": string
  },
  "<KEY2>": {
    "N": string
  }
},
````

### put-item

````shell
$ aws dynamodb put-item --table-name MusicCollection --item file://get-item.json 
````

````json
{
  "<KEY1>": {
    "S": string
  },
  "<KEY2>": {
    "N": string
  }
},
````

### batch-get-item

````shell
$ aws dynamodb batch-get-item --request-items file://batchget.json 
````

````json
{
  "<TABLE_NAME>": {
    "Keys": [
      {
        "<KEY1>": {
          "S": string
        }
      },
      {
        "<KEY2>": {
          "N": string
        }
      }
    ]
  }
}
````
