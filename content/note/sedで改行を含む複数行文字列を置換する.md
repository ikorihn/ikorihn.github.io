---
title: sedで改行を含む複数行文字列を置換する
date: 2024-02-27T14:04:00+09:00
tags:
  - shell
  - sed
---

GNU sedでは `-z` で行の区切りをNUL文字にすることができる。

```shell
❯ cat Dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:latest
RUN echo hello && \
  yum update && \
  yum install -y && \
  git && \
  curl

❯ sed -z -r 's/(yum install.*git && \\\n)/\1  vim \&\& \\\n/' Dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:latest
RUN echo hello && \
  yum update && \
  yum install -y && \
  git && \
  vim && \
  curl

```

こうすると処理の単位が行ごとではなくてファイル全体(NUL文字ごと)となるので、改行をまたいでマッチさせることができる。

single quote の扱いも困ったのでメモ -> [[sedでsingle quoteをエスケープする]] 