---
title: LocalStack内のLambdaからDynamoDBやSESを実行するときのEndpoint
date: 2023-11-20T18:53:00+09:00
tags:
  - AWS
  - Go
lastmod: '2024-03-05T11:56:36+09:00'
---

[[LocalStack]]内で動作している [[AWS Lambda]] から、他のリソースにアクセスするときのエンドポイントに `localhost:4566` を設定してみたら、アクセスできなかったので調べた。

## 結論

環境変数 `LOCALSTACK_HOSTNAME` を使う。
[ドキュメント](https://docs.localstack.cloud/references/configuration/#deprecated) 上はこの変数はDEPRECATEDになっていて、 `LOCALSTACK_HOST` を使うように言われているが、LocalStack 2.3.2 時点ではLambda上でos.Getenvしても `LOCALSTACK_HOST` には値が入っていなかった。。


## 例

```go
awsConf := &aws.Config{}
if localStack, ok := os.LookupEnv("LOCALSTACK_HOSTNAME"); ok {
    awsConf.Endpoint = aws.String(fmt.Sprintf("http://%s:4566", localStack))
}
sess := session.Must(session.NewSession(awsConf))
dc := dynamodb.New(sess)
```


## 2024-03-05 追記

自分が読み間違えていた。
この環境変数はLocalStackのデフォルトのURL localhost.localstack.cloud:4566 を任意の値に設定するための環境変数であって、実行環境にセットされるものではなさそう。

https://github.com/localstack/localstack/blob/76292e1d01d3141cbedfc0aea9f7b36095d6a23a/localstack/services/lambda_/invocation/execution_environment.py#L146
`LOCALSTACK_RUNTIME_ENDPOINT` で取得するのがよさそう。
=> この環境変数もセットされてなかった。なにもわからん…

Lambdaハンドラー内で環境変数を取得してみると、以下のような環境変数が取れた (一部抜粋)

```python
    for k, v in os.environ.items():
        print(f"{k}={v}")
```

```
AWS_ENDPOINT_URL=http://172.28.0.3:4566
AWS_EXECUTION_ENV=AWS_Lambda_python3.12
AWS_LAMBDA_FUNCTION_MEMORY_SIZE=128
AWS_LAMBDA_FUNCTION_NAME=my-function
AWS_LAMBDA_FUNCTION_TIMEOUT=3
AWS_LAMBDA_FUNCTION_VERSION=$LATEST
AWS_LAMBDA_INITIALIZATION_TYPE=on-demand
AWS_LAMBDA_RUNTIME_API=127.0.0.1:9001
AWS_REGION=ap-northeast-1
EDGE_PORT=4566
LAMBDA_RUNTIME_DIR=/var/runtime
LAMBDA_TASK_ROOT=/var/task
LANG=en_US.UTF-8
LC_CTYPE=C.UTF-8
LD_LIBRARY_PATH=/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib
LOCALSTACK_HOSTNAME=172.28.0.3
```

`DEBUG=1` にしてログを取ると、Lambda発火時に以下のようなログが出ていた。
ここでは `LOCALSTACK_RUNTIME_ENDPOINT` が取れているけど、求めているものとは違った。
素直に `localhost.localstack.cloud:4566` を使うようにしよう

```
2024-03-05T03:40:04.269 DEBUG --- [cs:$LATEST_0] l.u.c.docker_sdk_client    : Creating container with attributes: {'self': <localstack.utils.container_utils.docker_sdk_client.SdkDockerClient object at 0xffffa4d012d0>, 'image_name': 'public.ecr.aws/lambda/python:3.12', ... 'LOCALSTACK_RUNTIME_ID': '4b44dc24815c8c57feb4e2a55dc389a5', 'LOCALSTACK_RUNTIME_ENDPOINT': 'http://172.28.0.3:4566/_localstack_lambda/4b44dc24815c8c57feb4e2a55dc389a5', 'LOCALSTACK_FUNCTION_ACCOUNT_ID': '000000000000', 'AWS_ENDPOINT_URL': 'http://172.28.0.3:4566', '_HANDLER': 'main.lambda_handler', 'AWS_EXECUTION_ENV': 'AWS_Lambda_rapid', 'LOCALSTACK_INIT_LOG_LEVEL': 'debug', 'LOCALSTACK_MAX_PAYLOAD_SIZE': 6291556},
```