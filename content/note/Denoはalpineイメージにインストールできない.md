---
title: Denoはalpineイメージにインストールできない
date: 2024-02-14T12:25:00+09:00
tags:
  - Deno
  - Docker
---

できないんかい

https://github.com/denoland/deno/issues/1658

glibcが必要なため、[[Alpineにglibcをインストールする]] とかいう黒魔術が必要となる。
あんまりこれはやりたくないので、普通にdebian-slimとかにインストールするといいと思う。

```Dockerfile
FROM public.ecr.aws/docker/library/debian:stable-slim
RUN apt-get update \
  && apt-get install -y curl unzip \
  && curl -fsSL https://deno.land/x/install/install.sh | sh \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"
```
