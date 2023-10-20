---
title: Dockerfile内で条件分岐する
date: 2023-05-05T20:23:00+09:00
tags:
- Docker
---

[docker - Dockerfile if else condition with external arguments - Stack Overflow](https://stackoverflow.com/questions/43654656/dockerfile-if-else-condition-with-external-arguments)
[Dockerfile 内で条件に応じて処理を変えたかったので試行錯誤したメモ - ようへいの日々精進XP](https://inokara.hateblo.jp/entry/2021/01/02/165315)

前提として、Dockerfile内で制御構文は使えない。使わずシンプルにするっていう思想になっている

## 1. shell scriptで分岐

````dockerfile
FROM centos:7
ARG arg
RUN if [[ -z "$arg" ]] ; then echo Argument not provided ; else echo Argument is $arg ; fi
````

これだとshell内でできることは分岐できるがCOPYなどDockerfile内のコマンドには使えない。

## 2. マルチステージビルドを使う

````dockerfile
ARG my_arg

FROM centos:7 AS base
RUN echo "do stuff with the centos image"

FROM base AS branch-version-1
RUN echo "this is the stage that sets VAR=TRUE"
ENV VAR=TRUE

FROM base AS branch-version-2
RUN echo "this is the stage that sets VAR=FALSE"
ENV VAR=FALSE

FROM branch-version-${my_arg} AS final
RUN echo "VAR is equal to ${VAR}"
````

`docker build -t my_docker . --build-arg my_arg=2`

baseを基準のイメージとして、複数種類のstageを定義してglobalなARGでstage名を指定する

## 2'. targetを指定する

`--build-arg` で指定するのではなく、マルチステージビルドの `--target` で指定する方法。こちらのほうがtargetが明確になっていいと思った。

````dockerfile
FROM foo as base
RUN ...
WORKDIR /opt/my-proj

FROM base as npm-ci-dev
# invalidate cache
COPY --chown=www-data:www-data ./package.json /opt/my-proj/package.json
COPY --chown=www-data:www-data ./package-lock.json /opt/my-proj/package-lock.json
RUN npm ci

FROM base as npm-ci-prod
# invalidate cache
COPY --chown=www-data:www-data ./package.json /opt/my-proj/package.json
COPY --chown=www-data:www-data ./package-lock.json /opt/my-proj/package-lock.json
RUN npm ci --only=prod

FROM base as proj-files
COPY --chown=www-data:www-data ./ /opt/my-proj

FROM base as image-dev
# Will mount, not copy in dev environment
RUN ...

FROM base as image-ci
COPY --from=npm-ci-dev /opt/my-proj .
COPY --from=proj-files /opt/my-proj .
RUN ...

FROM base as image-stage
COPY --from=npm-ci-prod /opt/my-proj .
COPY --from=proj-files /opt/my-proj .
RUN ...

FROM base as image-prod
COPY --from=npm-ci-prod /opt/my-proj .
COPY --from=proj-files /opt/my-proj .
RUN ...
````

`docker build --target image-dev -t foo .`
