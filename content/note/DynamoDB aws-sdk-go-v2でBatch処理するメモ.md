---
title: DynamoDB aws-sdk-go-v2でBatch処理するメモ
date: 2023-09-22T11:56:00+09:00
tags:
- Go
- DynamoDB
---

[Go](note/Go.md) でDynamoDBを操作するときguregu/dynamoを使うことも多いですが、[BatchGetが遅い](note/guregu%2FdynamoでのBatchGetが遅いので調べた.md) ことがあったのとaws-sdk-go v1に対応していないので、直接aws-sdk-go-v2を使うことにした

## サンプル

BatchGetItemを直接使うサンプルは公式になかったので、PartiQLを使う例を参考にして作る。

[aws-doc-sdk-examples/gov2/dynamodb/actions/partiql.go at main · awsdocs/aws-doc-sdk-examples](https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/gov2/dynamodb/actions/partiql.go#L153)
