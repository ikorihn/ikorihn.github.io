---
title: Docker build時にhostのsshキーを使う
date: "2022-12-29T12:06:00+09:00"
tags:
  - 'Docker'
  - 'git'
lastmod: "2022-12-29T14:46:00+09:00"
---

#Docker #git

## 参考

[BuildKit でイメージ構築 — Docker-docs-ja 20.10 ドキュメント](https://docs.docker.jp/develop/develop-images/build_enhancements.html)
[docker buildする際にhost側のssh keyを使ってbuildする - Qiita](https://qiita.com/toyama0919/items/190eb19298e523094ba2)
[Docker の BuildKit を使ってセキュアなビルドを試す - Qiita](https://qiita.com/takasp/items/56e1399a484ed5bfaade)

## デフォルトのssh keyを使う場合

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine

# ssh クライアントと git をインストール
RUN apk add --no-cache openssh-client git

# github.com のための公開鍵をダウンロード
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

# プライベート・リポジトリのクローン
RUN --mount=type=ssh git clone git@github.com:myorg/myproject.git myproject
```

```shell
$ export DOCKER_BUILDKIT=1
$ docker build --ssh default .
```

## ファイルを指定する場合

`type=secret` を使うと以下のようにできる

```dockerfile
# syntax = docker/dockerfile:1

FROM alpine

# デフォルトのシークレットの場所から、シークレットを表示
RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret

# 任意のシークレットの場所から、シークレットを表示
RUN --mount=type=secret,id=mysecret,dst=/foobar cat /foobar
```

```shell
$ docker build --secret id=mysecret,src=mysecret.txt .
```

これを使ってssh keyを渡す

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine

# ssh クライアントと git をインストール
RUN apk add --no-cache openssh-client git

# github.com のための公開鍵をダウンロード
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

# プライベート・リポジトリのクローン
RUN --mount=type=secret,id=ssh,dst=/root/.ssh/id_rsa git clone git@github.com:myorg/myproject.git myproject
```

```shell
$ docker build --secret id=ssh,src=~/.ssh/id_rsa_github .
```
