---
title: CI上でECRに対してログインしてビルドしたイメージをpushする
date: 2024-03-26T17:46:00+09:00
tags:
  - Docker
  - AWS
---

[[ECR]] にpushするときには[[Docker]]でloginが必要となる。
一番お手軽なのは、[[AWS CLI]] を使うやり方ではないだろうか
```shell
aws ecr get-login-password | docker login --username AWS --password-stdin  <account>.dkr.ecr.<region>.amazonaws.com
```

しかし、コンテナ上で実行されるCIで、 [[AWS CLI]] がインストールされているコンテナと [[Docker]] がインストールされているコンテナが分かれているとこの方法がとれない。

そこで [awslabs/amazon-ecr-credential-helper](https://github.com/awslabs/amazon-ecr-credential-helper) を使用して以下のようにしてみた。
こんな記法のCIはないが、疑似CIのコードを書くと以下のような感じ

```yaml
# ecr-loginをインストール
- image: golang
  command: go install github.com/awslabs/amazon-ecr-credential-helper/ecr-login/cli/docker-credential-ecr-login@latest
# 別アカウントに対してAssumeRoleするような場合はsession tokenを取得。そうでなければこれは不要
- image: awscli
  command: aws sts assume-role --role-arn "<role arn>" --role-session-name "<session name>"
  output:
    AWS_ACCESS_KEY_ID: <access key>
    AWS_SECRET_ACCESS_KEY: <secret>
    AWS_SESSION_TOKEN: <token>
- image: docker 
  command: |-
    # ecr-loginをPATHの通った場所に配置
    mv docker-credential-ecr-login /usr/local/bin/
    # credential helperを使用する設定
    mkdir -p ~/.docker
    cat <<'EOF' > ~/.docker/config.json
    {
      "credHelpers": {
        "<account>.dkr.ecr.<region>.amazonaws.com": "ecr-login"
      }
    }
    EOF
    
    docker build -t <account>.dkr.ecr.<region>.amazonaws.com/my-image:latest .
    # これが通るはず
    docker push <account>.dkr.ecr.<region>.amazonaws.com/my-image:latest
```
