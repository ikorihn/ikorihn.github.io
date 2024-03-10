---
title: AWS SAMで既存のS3バケットへのPutをトリガーにLambdaを実行する設定はできないのでどうするか
date: 2024-03-07T18:50:00+09:00
tags:
  - AWS
  - sam
---

https://github.com/aws/serverless-application-model/blob/master/versions/2016-10-31.md#s3
にあるとおり、[[SAM]] では作成済みバケットに紐づくトリガーは設定することができず、template.yamlにバケットの定義も含める必要がある。
これは [[CloudFormation]] の制約のようなのでどうすることもできなさそうだ。

## workaround

[[AWS Lambda|Lambda]] はSAMで作成して、それとは別に `aws s3api put-bucket-notification-configuration` コマンドでトリガー 

https://github.com/aws/serverless-application-model/issues/124#issuecomment-511779961

```shell
FUNCARN=$(aws cloudformation describe-stacks \
  --stack-name "my-stack-name" \
  --query 'Stacks[0].Outputs[0].OutputValue'
)

JSON=$(cat <<-EOF
  {
    "LambdaFunctionConfigurations": [
      {
        "Id": "MyEventsName",
        "LambdaFunctionArn": ${FUNCARN},
        "Events": [
          "s3:ObjectCreated:*"
        ]
      }
    ]
  }
EOF
)

aws s3api \
  put-bucket-notification-configuration \
  --bucket="my-bucket-name" \
  --notification-configuration "$JSON"
```

## 他の手段

[CloudFormation 一撃で既存のS3バケットでAWS LambdaのS3のオブジェクト作成通知を追加作成してみた | DevelopersIO](https://dev.classmethod.jp/articles/cloudformation-add-s3-notification-lambda/)

S3通知設定を更新するLambdaを一緒にデプロイするということのようだ。パワープレイ💪感あるが公式ブログでも紹介されているし問題ないのかな

## Tips

[AWS CLIでput-bucket-notification-configurationするときにjqで既存の設定と追加差分を上手いことマージする #AWS - Qiita](https://qiita.com/kusyua/items/ead3630018be877dc651)