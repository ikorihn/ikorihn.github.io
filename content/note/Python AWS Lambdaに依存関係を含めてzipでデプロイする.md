---
title: Python AWS Lambdaに依存関係を含めてzipでデプロイする
date: 2024-03-08T14:27:00+09:00
tags:
  - Python
  - Lambda
lastmod: '2024-03-08T14:27:57+09:00'
---
[[AWS Lambda|Lambda]] のコードを依存関係込でデプロイするには、すべてをまとめてzipファイルに格納する必要がある。
詳しくはこちら https://docs.aws.amazon.com/lambda/latest/dg/python-package.html

以下のようなファイル構成で、main.pyがhandlerのコードを含む。

```
.
├── main.py
└── requirements.txt

$ cat requirements.txt
boto3==1.34.58 ; python_version >= "3.12" and python_version < "4.0"
botocore==1.34.58 ; python_version >= "3.12" and python_version < "4.0"
```

## zipファイルを作成

ライブラリの階層に注意してzipにする。
zipファイルのルートにライブラリが配置されるようにする。

```shell
## 依存関係を `package`(名前はなんでもいい) ディレクトリにインストールする
$ mkdir -p package
$ pip install -r requirements.txt -t ./package

## rootにインストール済みライブラリを含むzipファイルを作成する
$ cd package
$ zip -r ../my_deployment_package.zip .

## zipファイルのrootに自分のコードを追加する
$ cd ../
$ zip my_deployment_package.zip main.py

$ unzip -t my_deployment_package.zip
    ......
    testing: boto3/                   OK
    testing: boto3/s3/                OK
    testing: boto3/s3/constants.py    OK
    testing: boto3/s3/__init__.py     OK
    testing: main.py
```

## zipファイルをアップロード

```shell
$ aws lambda create-function --function-name ${FUNCTION_NAME} --runtime python3.12 --handler main.lambda_handler --role arn:aws:iam::000000000000:role/myrole --zip-file fileb://my_deployment_package.zip
# 更新
$ aws lambda  update-function-code --function-name ${FUNCTION_NAME} --zip-file fileb://my_deployment_package.zip
```