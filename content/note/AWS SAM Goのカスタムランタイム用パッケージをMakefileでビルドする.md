---
title: AWS SAM Goのカスタムランタイム用パッケージをMakefileでビルドする
date: 2023-10-28T18:08:00+09:00
tags:
  - Go
  - Lambda
---

[[AWS Lambda]] で [go1.x ランタイムが使えなくなる](https://aws.amazon.com/blogs/compute/migrating-aws-lambda-functions-from-the-go1-x-runtime-to-the-custom-runtime-on-amazon-linux-2/) ので、カスタムランタイムに移行しようと思います。
ビルドのコマンドをカスタマイズしたかったので、 [[Make]] を使ってビルドできるように設定します。

## 公式ドキュメント

{{< card-link "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/building-custom-runtimes.html" }}

- template.yamlの `Metadata.BuildMethod` を `makefile` にする
- Makefileにビルドターゲットを `build-<function-logical-id>` という名前で作成し、ここにビルドコマンドを書く
- Makefileの置いてあるディレクトリを `Properties.CodeUri` に指定し、名前は `Makefile` にする

## サンプル

以下のようなディレクトリ構造の [[Go]] アプリケーションを例に説明します。

```txt
.
├── cmd
│  └── hello
│     └── main.go
├── sam
│  └── template.yaml
├── go.mod
├── go.sum
├── Makefile
└── app.go
```

template.yamlを次のようにします。
- `Runtime`: Amazon Linux 2
- `Architectures`: arm64
- `Handler`: `bootstrap` に固定

```yaml:title=template.yaml
Resources:
  MyLambdaFuction:
    Type: AWS::Serverless::Function
    Metadata:
      BuildMethod: makefile
    Properties:
      FunctionName: my-lambda
      Handler: bootstrap
      CodeUri: ../
      Runtime: provided.al2
      Architectures: [arm64]
      MemorySize: 1024
```

Makefileを作成します。

`$(ARTIFACTS_DIR)` はアーティファクトの配置先を格納する環境変数です。`{SAM実行ディレクトリ}/.aws-sam/build/MyLambdaFuction` に設定されていて、ここに `bootstrap` を配置することでLambdaを実行できます。

```Makefie
MAKEFILE_DIR:=$(dir $(abspath $(lastword $(MAKEFILE_LIST))))

build-MyLambdaFunction:
	go build -ldflags '-s -w' -trimpath -tags lambda.norpc -o $(MAKEFILE_DIR)bin/bootstrap ./src/hello
	mv $(MAKEFILE_DIR)bin/bootstrap $(ARTIFACTS_DIR)/.
```
