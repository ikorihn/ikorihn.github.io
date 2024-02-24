---
title: alpineでAndroidアプリをビルドするイメージを作成
date: "2022-07-05T18:10:00+09:00"
tags:
  - 'Docker'
lastmod: "2022-07-05T18:10:00+09:00"
---

#Docker

## やったこと

以下を参考にDockerfileを作成

[Androidのビルド用Dockerイメージダイエット計画 - dely tech blog](https://tech.dely.jp/entry/2020/12/07/170000)
[Androidアプリのビルド環境Dockerイメージ制作 - Qiita](https://qiita.com/kaihei777/items/1a94a8a329c8fb67d421)
[DockerでAndroidアプリのビルド環境を作る - Qiita](https://qiita.com/kichinaga/items/66872432747e76d72af7)

- Android SDKをインストールしたコンテナを公開してしまうとライセンス違反になるので公開はしない
- ベースイメージはalpineをつかいサイズを小さくする

### glibcをインストール

[sgerrand/alpine-pkg-glibc: A glibc compatibility layer package for Alpine Linux](https://github.com/sgerrand/alpine-pkg-glibc)

```shell
wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-2.35-r0.apk
apk add glibc-2.35-r0.apk
```

localeの指定が必要ならglibc-i18nを入れる

```shell
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-bin-2.35-r0.apk
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-i18n-2.35-r0.apk
apk add glibc-bin-2.35-r0.apk glibc-i18n-2.35-r0.apk
/usr/glibc-compat/bin/localedef -i en_US -f UTF-8 en_US.UTF-8
```

Dockerfileは、alpineにglibcをインストールしたイメージ https://hub.docker.com/r/frolvlad/alpine-glibc/ を参考にする

[docker-alpine-glibc/Dockerfile at master · Docker-Hub-frolvlad/docker-alpine-glibc](https://github.com/Docker-Hub-frolvlad/docker-alpine-glibc/blob/master/Dockerfile)

```Dockerfile
ENV LANG=C.UTF-8

# install alpine-pkg-glibc apk and set C.UTF-8 locale as default
RUN BASE_URL="https://github.com/sgerrand/alpine-pkg-glibc/releases/download" && \
    VERSION="2.35-r0" && \
    BASE_FILE="glibc-$VERSION.apk" && BIN_FILE="glibc-bin-$VERSION.apk" && I18N_FILE="glibc-i18n-$VERSION.apk" && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget "$BASE_URL/$VERSION/$BASE_FILE" && wget "$BASE_URL/$VERSION/$BIN_FILE" && wget "$BASE_URL/$VERSION/$I18N_FILE" && \
    apk add --no-cache "$BASE_FILE" "$BIN_FILE" "$I18N_FILE" && \
    rm "/etc/apk/keys/sgerrand.rsa.pub" && \
    /usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 "$LANG" || true && \
    echo "export LANG=$LANG" > /etc/profile.d/locale.sh && \
    apk del glibc-i18n && \
    rm "/root/.wget-hsts" && \
    apk del .build-dependencies && \
    rm "$BASE_FILE" "$BIN_FILE" "$I18N_FILE"
```

2.35でバグがあり、/lib64にglibcではなくmuslのまま配置されるので2.34に下げた
[2.35-r0: glibc compatibility regression due to removal of /lib64 · Issue #181 · sgerrand/alpine-pkg-glibc · GitHub](https://github.com/sgerrand/alpine-pkg-glibc/issues/181)

## 完成系

```Dockerfile
FROM alpine:3.16

ARG ANDROID_SDK_TOOLS="8512546"

ENV LANG=C.UTF-8
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/local/java-8
ENV PATH=$PATH:${ANDROID_SDK_ROOT}/cmdline-tools/bin:${JAVA_HOME}/bin

# 参考 https://github.com/Docker-Hub-frolvlad/docker-alpine-glibc
RUN BASE_URL="https://github.com/sgerrand/alpine-pkg-glibc/releases/download" && \
    VERSION="2.34-r0" && \
    BASE_FILE="glibc-$VERSION.apk" && BIN_FILE="glibc-bin-$VERSION.apk" && I18N_FILE="glibc-i18n-$VERSION.apk" && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget "$BASE_URL/$VERSION/$BASE_FILE" "$BASE_URL/$VERSION/$BIN_FILE" "$BASE_URL/$VERSION/$I18N_FILE" && \
    apk add --no-cache "$BASE_FILE" "$BIN_FILE" "$I18N_FILE" && \
    rm "/etc/apk/keys/sgerrand.rsa.pub" && \
    /usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 "$LANG" || true && \
    echo "export LANG=$LANG" > /etc/profile.d/locale.sh && \
    apk del glibc-i18n && \
    rm "$BASE_FILE" "$BIN_FILE" "$I18N_FILE"

# Java(Amazon Corretto 17)
RUN mkdir -p $JAVA_HOME && cd $JAVA_HOME && \
    wget https://corretto.aws/downloads/latest/amazon-corretto-17-x64-alpine-jdk.tar.gz && \
    tar -xzf amazon-corretto-17-x64-alpine-jdk.tar.gz --strip-components 1 && \
    rm amazon-corretto-17-x64-alpine-jdk.tar.gz

# Android SDK
ENV ANDROID_API_LEVELS=android-29,android-30
ENV ANDROID_BUILD_TOOLS_VERSIONS=29.0.3,30.0.1
RUN FILE=commandlinetools-linux-${ANDROID_SDK_TOOLS}_latest.zip && \
    mkdir -p ${ANDROID_SDK_ROOT} && cd ${ANDROID_SDK_ROOT} && \
    wget https://dl.google.com/android/repository/${FILE} && \
    unzip ${FILE} && rm ${FILE} && \
    yes | sdkmanager --licenses > /dev/null && \
    yes | sdkmanager $(echo ${ANDROID_BUILD_TOOLS_VERSIONS} | sed 's/,/\n/g' | sed -E 's/(.+)/build-tools;\1/g' | tr '\n' ' ') "platform-tools" $(echo ${ANDROID_API_LEVELS} | sed 's/,/\n/g' | sed -E 's/(.+)/platforms;\1/g' | tr '\n' ' ')
    
RUN mkdir /workspace
WORKDIR /workspace
```
