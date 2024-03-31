---
title: docker buildxでマルチアーキテクチャビルド
date: 2024-03-26T17:53:00+09:00
tags:
  - Docker
---

[docker buildx build | Docker Docs](https://docs.docker.com/reference/cli/docker/buildx/build/)

```shell
docker buildx build --platform linux/amd64,linux/arm64 --push -t multiarch-test:latest .
```

`--push` は `--output=type=registry` と等価で、これは `--output=type=image,push=true` のショートカット。
つまりimageとmanifestを作成して、registryにpushまでやってくれる。

### マルチアーキテクチャのイメージに個別に名前をつけたい場合(あまりないと思うが…)

上記でだいたい事足りるのだが、イメージ名称をどうしてもつけたい場合以下のように手動でいろいろやる

```shell
IMAGE_NAME=multiarch-test

docker buildx build --platform linux/amd64 -t ${IMAGE_NAME}_amd64 .
docker buildx build --platform linux/arm64/v8 -t ${IMAGE_NAME}_arm64 .

docker push ${IMAGE_NAME}_amd64
docker push ${IMAGE_NAME}_arm64
docker manifest create ${IMAGE_NAME} ${IMAGE_NAME}_x86_64 ${IMAGE_NAME}_armv8
docker manifest push ${IMAGE_FULL_NAME}
```