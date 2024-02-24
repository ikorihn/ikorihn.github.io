---
title: AWS CDK v2でDynamoDB、S3、Glue、Athenaの環境構築
date: 2024-02-04T17:07:00+09:00
tags:
  - AWS
  - CDK
draft: "true"
---

[[Athena]] を試しに使ってみたかっただけなのだが、派手に脱線して[[CDK]]で構築してみた。

ひとまず [CDKでDynamoDBのデータをAthenaで分析する環境をつくる](https://qiita.com/oganyanATF/items/ffbb0c932be219010e1a) を参考にベースを作る。
これは aws cdk v1の書き方なので、v2に書き換える
