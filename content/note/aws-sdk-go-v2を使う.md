---
title: aws-sdk-go-v2を使う
date: 2021-08-18T12:13:00+09:00
lastmod: 2021-08-18T12:15:07+09:00
tags:
- Go
- AWS
---

[AWS](note/AWS.md) を [Go](note/Go.md) で操作するライブラリ

aws-sdk-go-v2が2021-01-19にリリースされた。
[AWS SDK for Go のバージョン 2 が一般公開されました](https://aws.amazon.com/jp/about-aws/whats-new/2021/01/aws-sdk-for-go-version-2-now-generally-available/)

<https://aws.amazon.com/jp/sdk-for-go/>

 > 
 > AWS SDK for Go を使用すると、AWS の使用を迅速に開始できます。この SDK を使用して、Amazon S3、Amazon DynamoDB、Amazon SQS などの AWS の各種サービスと Go アプリケーションを簡単に統合できます。

* モジュール化により使用するサービスごとにgo getでインストールして不要なサービスは除外できる
* CPU およびメモリの使用率における顕著な改善
* APIが簡潔になった
* エラーハンドリングが強化された
* pagination, waitが改善された
* middlewareを使ってリクエスト時のカスタマイズが可能になった

## インストール

<https://github.com/aws/aws-sdk-go-v2>

````shell
$ go get github.com/aws/aws-sdk-go-v2/aws
$ go get github.com/aws/aws-sdk-go-v2/config

# 使うサービスのみインストールする
$ go get github.com/aws/aws-sdk-go-v2/service/s3
````

## リファレンス

<https://pkg.go.dev/github.com/aws/aws-sdk-go-v2>

## 使い方

````go
import (
	"context"
	"fmt"
	"io/ioutil"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"golang.org/x/xerrors"
)

func RetrieveFile(ctx context.Context) ([]byte, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, xerrors.Errorf(": %w", err)
	}

	client = s3.NewFromConfig(cfg)

	input := &s3.GetObjectInput{
		Bucket: aws.String("sample-bucket"),
		Key:    aws.String("path/to/myfile"),
	}

	output, err := client.GetObject(ctx, input)
	if err != nil {
		return nil, xerrors.Errorf(": %w", err)
	}

	defer output.Body.Close()
	b, err := ioutil.ReadAll(output.Body)
	if err != nil {
		return nil, xerrors.Errorf(": %w", err)
	}

	fmt.Printf("body: %s\n", string(b))

	return b, nil
}
````

## ユニットテスト

<https://aws.github.io/aws-sdk-go-v2/docs/unit-testing/>

v1には `xxxiface` パッケージ([例: sqsiface](https://docs.aws.amazon.com/sdk-for-go/api/service/sqs/sqsiface/))があり、インターフェースが定義されていたがv2ではなくなっているので自分でinterfac\[\[\]\]eを定義してmockする。
