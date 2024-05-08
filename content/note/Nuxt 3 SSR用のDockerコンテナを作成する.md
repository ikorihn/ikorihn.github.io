---
title: Nuxt 3 SSR用のDockerコンテナを作成する
date: 2024-05-08T16:43:00+09:00
tags:
  - Docker
  - Nuxtjs
---

[[Nuxt 3]] を [[Docker]] で動かすにあたって、素直にDockerfileを作成するとプロダクションには不要なファイルも含んだコンテナができてしまいます。
セキュリティ上も、コンテナサイズの面でもよろしくないのでいい作成方法を調査しました。

## Dockerfile

```dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine3.19 as builder

WORKDIR /app
COPY ./package* ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# run environment
FROM public.ecr.aws/docker/library/node:20-alpine3.19

RUN apk update && apk add --no-cache tini

WORKDIR /app

COPY --from=builder /app/.output ./

# Run with tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./server/index.mjs"]
```

### マルチステージビルドを活用する

実行環境とビルド環境を分けることで、実行環境には必要最低限のファイルのみが配置されるようにします。
ポイントとしては以下です。

- Nuxt 3では `nuxt build` すると `.output` ディレクトリに成果物が作成されます。実行環境にはこのディレクトリ内のファイルのみをコピーします。
- `node .output/server/index.mjs` でサーバーを起動することができます。

### PID 1問題への対処

[[Node.js]] のプロセスがPID 1で動作するため、SIGTERMなど一部のシグナルが効かない。
これを解消するためのアプローチはいくつかあるが、ここでは [Tini](https://github.com/krallin/tini) を使う。

## ビルド&実行

```shell
$ docker build -t nuxt3-sample .
$ docker run --rm -p 3000:3000 --name nuxt3 nuxt3-sample:latest
```

これで `localhost:3000` でアクセスできれば成功です。