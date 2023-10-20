---
title: SecretsManagerをCLIで更新する
date: 2022-09-12T19:15:00+09:00
tags:
- AWS
lastmod: 2022-09-12T19:16:00+09:00
---

\#AWS

aws cli(v1) secretsmanager コマンドで取得、更新したい
https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/index.html

## 必要権限

* GetSecretValue
* PutSecretValue

## コマンド

### 取得

````shell
$ aws --region ap-northeast-1 secretsmanager get-secret-value --secret-id my_secret
{
    "ARN": "arn:aws:secretsmanager:ap-northeast-1:xxxxxxxxx:secret:my_secret_xxxxxxx",
    "Name": "my_secret",
    "VersionId": "<UUID>",
    "SecretString": "{\n  \"user\": \"foo\",\n  \"password\": \"bar\" }",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": 16620000000
}
````

Secretだけを取得したい

````shell
$ aws --region ap-northeast-1 secretsmanager get-secret-value --secret-id my_secret --query SecretString --output text
{
    "user": "foo",
    "password": "bar"
}
````

### 更新

キーを追加したり、あるキーの値を更新したい場合も、JSONで全体を指定しなくてはいけないのが面倒だがjqでなんとかする。

````shell
SECRET_ID=my_secret
original=$(aws --region ap-northeast-1 secretsmanager get-secret-value --secret-id $SECRET_ID)

KEY=bar
NEW_VALUE=hoge

echo $original | jq --arg my_value $NEW_VALUE '. + { my_value: $my_value }' > /tmp/new_secrets.json

aws --region ap-northeast-1 secretsmanager put-secret-value --secret-id $SECRET_ID --secret-string file://tmp/new_secrets.json

````

[jq Manual (development version)](https://stedolan.github.io/jq/manual/#Invokingjq)
[Add a field to an object with JQ · GitHub](https://gist.github.com/joar/776b7d176196592ed5d8)

* jq の `--arg` を使って変数をセットする
* フィールドを追加(同名のキーがあれば上書き)のコマンドでJSONを更新する
* `/tmp/new_secrets.json` に変更後のJSONを書き出す
* `put-secret-value` の `--secret-string` にはファイルを指定できるので、 `/tmp/new_secrets.json` を指定する

### おまけ

secretsmanagerのvalueにJSONをいれたい場合

````shell
SECRET_ID=my_secret
original=$(aws --region ap-northeast-1 secretsmanager get-secret-value --secret-id $SECRET_ID)

KEY=bar
new_value=$(echo $original | jq -r '.my_value' | jq -r -c --arg password "${PASSWORD}" ". + { ${KEY}: {  password: \$password } }")

echo $original | jq --arg my_value $new_value '. + { my_value: $my_value }' > /tmp/new_secrets.json

aws --region ap-northeast-1 secretsmanager put-secret-value --secret-id $SECRET_ID --secret-string file://tmp/new_secrets.json
````
