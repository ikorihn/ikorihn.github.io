---
title: docker buildxでマルチアーキテクチャビルド
date: 2024-03-26T17:53:00+09:00
tags:
  - Docker
lastmod: 2024-06-21T17:53:00+09:00
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

Dockerfile

```dockerfile
FROM public.ecr.aws/docker/library/alpine:3.19
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETARCH
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM" > /log
RUN apk --no-cache add curl
```

利用できる変数は [Dockerfile reference | Docker Docs](https://docs.docker.com/reference/dockerfile/#automatic-platform-args-in-the-global-scope) を参照

## docker build時に`echo` や `apk` などを実行するタイミングで `exec format error` になる

`docker buildx build --platform` でplatformを指定しているのに、なんでArchitecture不一致のエラーが出るのか？？

```
#4 [1/6] FROM public.ecr.aws/docker/library/alpine:3.19@sha256:af4785ccdbcd5cde71bfd5b93eabd34250b98651f19fe218c91de6c8d10e21c5
#4 sha256:af4785ccdbcd5cde71bfd5b93eabd34250b98651f19fe218c91de6c8d10e21c5 1.64kB / 1.64kB done
#4 sha256:cc8129666469e0512c44e1c1be9710238b05d07e91401753972d2c3ae1855655 528B / 528B done
#4 sha256:15a7f89014217cecb2385dd28c17e61aac6c04e684a364eff2e2a52cd012bda9 1.49kB / 1.49kB done
#4 sha256:d4f2d2bd5ed999e04bfbfb910f14154b488ad32abf053954bff805f47fc3ad1e 0B / 3.36MB 0.1s
#4 extracting sha256:d4f2d2bd5ed999e04bfbfb910f14154b488ad32abf053954bff805f47fc3ad1e
#4 sha256:d4f2d2bd5ed999e04bfbfb910f14154b488ad32abf053954bff805f47fc3ad1e 3.36MB / 3.36MB 0.2s done
#4 extracting sha256:d4f2d2bd5ed999e04bfbfb910f14154b488ad32abf053954bff805f47fc3ad1e 0.1s done
#4 DONE 0.4s

#6 [2/6] RUN echo "I am running on linux/amd64, building for linux/arm64" > /log
#6 0.193 exec /bin/sh: exec format error
```

### A. 実行環境にQEMUがインストールされていなかったため

[ERROR: failed to solve: process "/bin/sh · Issue #1986 · docker/buildx · GitHub](https://github.com/docker/buildx/issues/1986) や [Multi-platform images | Docker Docs](https://docs.docker.com/build/building/multi-platform/#qemu-without-docker-desktop) 
にあるように、[[QEMU]] がインストールされている必要がある。
これにより、異なるArchitectureの挙動をemulateできるようになる

[tonistiigi/binfmt](https://github.com/tonistiigi/binfmt) をprivilegedで実行してインストールする。

```shell
$ docker run --privileged --rm tonistiigi/binfmt --install all
```
