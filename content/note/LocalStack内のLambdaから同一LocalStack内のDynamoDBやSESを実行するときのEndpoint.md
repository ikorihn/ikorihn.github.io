---
title: LocalStack内のLambdaからDynamoDBやSESを実行するときのEndpoint
date: 2023-11-20T18:53:00+09:00
tags:
  - AWS
  - Go
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

