---
title: Alpineにglibcをインストールする
date: "2022-08-22T12:53:00+09:00"
tags:
  - 'Docker'
lastmod: "2022-08-22T12:53:00+09:00"
---

#Docker

Alpine Linuxにインストールされているのは glibc ではなくて musl-libc なので、適当にソフトウェアをインストールしても動かないということがたびたび発生する。
例: AWS CLI v2、Androidのビルド

## glibcをalpineにインストールする

[sgerrand/alpine-pkg-glibc: A glibc compatibility layer package for Alpine Linux](https://github.com/sgerrand/alpine-pkg-glibc)
をインストールする。
基本的にはREADMEの通りに。

alpineにglibcをインストールしたdockerイメージがあるので、そのDockerfileを参考にするとよいかも

[docker-alpine-glibc/Dockerfile at master · Docker-Hub-frolvlad/docker-alpine-glibc](https://github.com/Docker-Hub-frolvlad/docker-alpine-glibc/blob/master/Dockerfile)

2.35 ではバグがあり、/lib64にglibcではなくmuslのまま配置されるので、インストールしたものが動かないことがある。
解決していなさそうなので、2.34 にバージョンを下げることで対処。
[2.35-r0: glibc compatibility regression due to removal of /lib64 · Issue #181 · sgerrand/alpine-pkg-glibc · GitHub](https://github.com/sgerrand/alpine-pkg-glibc/issues/181)


### AlpineでAndroidビルドする

[GitHub - alvr/alpine-android: 🐋 Small docker image for building & testing Android applications.](https://github.com/alvr/alpine-android)

https://github.com/bell-sw/Liberica/blob/master/docker/repos/liberica-openjdk-alpine/11/Dockerfile


```Dockerfile
ARG JDK_VERSION=8
FROM amazoncorretto:${JDK_VERSION}-alpine-jdk as jdk

FROM alpine:3.16

# copy jdk
ARG JDK_VERSION=8
RUN mkdir /usr/lib/jvm
COPY --from=jdk /usr/lib/jvm/java-${JDK_VERSION}-amazon-corretto /usr/lib/jvm/default-jvm

ENV ANDROID_SDK_VERSION=8512546

ENV LANG=C.UTF-8
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/default-jvm
ENV PATH=$PATH:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${JAVA_HOME}/bin

RUN apk --update add \
        bash \
        jq \
        curl

# 参考: https://github.com/Docker-Hub-frolvlad/docker-alpine-glibc
# install alpine-pkg-glibc apk and set C.UTF-8 locale as default
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

# install Android SDK
RUN FILE=commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip && \
    mkdir -p ${ANDROID_SDK_ROOT} && \
    mkdir -p /tmp && \
    cd ${ANDROID_SDK_ROOT} && \
    wget https://dl.google.com/android/repository/${FILE} && \
    unzip ${FILE} && \
    rm ${FILE} && \
    cd cmdline-tools && \
    mkdir latest && \
    mv * latest/ && \
    mkdir -p ~/.android && \ touch ~/.android/repositories.cfg && \
    (yes || true) | sdkmanager --licenses
    
```


## 参考

[AWS CLI v2 で alpine glibc 問題に遭遇 - vague memory](https://htnosm.hatenablog.com/entry/2020/05/04/090000)
