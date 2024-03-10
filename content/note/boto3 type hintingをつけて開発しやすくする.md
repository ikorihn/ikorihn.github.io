---
title: boto3 type hintingをつけて開発しやすくする
date: 2024-02-27T18:51:00+09:00
tags:
  - Python
  - AWS
---

[[boto3]] のコードを書いていて、普通に `s3 = boto3.client("s3")` とすると型がついていなくて開発しにくい。

何種類かあるのだが、[boto3-stubs](https://pypi.org/project/boto3-stubs) が最もメンテがちゃんとされていそう [リポジトリ](https://github.com/youtype/mypy_boto3_builder)

過去に非公式で存在していたリポジトリをたらい回しにされた結果上にたどり着いた。
- https://github.com/alliefitter/boto3_type_annotations
- https://github.com/vemel/mypy_boto3
- https://github.com/vemel/mypy_boto3_builder

## インストール

[[Poetry]] で使ってみる。

```shell
## ec2やs3など主要なサービス用の型定義をインストールする
$ poetry add 'boto3-stubs[essential]'

## カンマ区切りで追加することもできる
$ poetry add 'boto3-stubs[essential, cloudwatch]'
```

## 使い方

```python
from mypy_boto3_s3.client import S3Client
from mypy_boto3_s3.service_resource import Object
import boto3

s3: S3Client = boto3.client("s3")
res = s3.get_object(Bucket="mybucket", Key="mykey/ggg.txt")
```

[[Neovim]] でもLSPでしっかり補完が効いてくれた

![[Pasted-image-20240227070736.png]]