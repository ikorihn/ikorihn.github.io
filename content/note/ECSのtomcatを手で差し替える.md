---
title: ECSのtomcatを手で差し替える
date: "2023-05-04T17:45:00+09:00"
tags:
  - '2023/04/30'
  - AWS
---

## やりたいこと

[[Elastic Container Service]] に対して、検証環境のリリースの際に通常通りtomcatコンテナビルド〜Rolling updateすると5分くらいはかかってしまう。
ちょっと設定を変えたいだけのときに時間がかかりすぎるので、オンプレのように手動でアップロードして手軽に変更したい。

## 手順

事前にECSタスクが実行されているEC2インスタンスを調べる

```shell
# warをローカルビルド
$ mvn package
# scp
$ scp target/app.war <EC2インスタンス>:
$ ssh <EC2インスタンス>

# dockerコンテナ内にコピー
[user@ip-xx-xx-xx-xx ~]$ docker cp app.war $(docker ps -f 'name=app' -q):/tmp
# dockerコンテナ内に入る
[user@ip-xx-xx-xx-xx ~]$ docker exec -it $(docker ps -f 'name=app' -q) bash

bash-4.2$ cp /tmp/app.war $TOMCAT_HOME/webapps/
# => デプロイされるのを待つ

```

#### 注意

`conf/server.xml` に `autoDeploy="true"` の設定が入っていないと、再読み込みされない

