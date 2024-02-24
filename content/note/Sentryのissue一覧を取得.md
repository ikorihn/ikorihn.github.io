---
title: Sentryのissue一覧を取得
date: "2021-08-04T15:24:00+09:00"
tags: 
---

#Sentry

1. APIトークンを取得
    1. https://docs.sentry.io/api/auth/
2. 取得したトークンを使用してAPIを実行

## issue一覧を取得する

https://docs.sentry.io/api/events/list-a-projects-issues/
```shell
curl -H 'Authorization: Bearer <auth_token>' https://sentry.io/api/0/projects/{organization_slug}/{project_slug}/issues/
```

ページネーションは `cursor` パラメータで指定する。
`<開始位置のissue id>:<開始位置から何番目のissueから表示するか>:<不明>`

一度に100件取得するので、次のページは `0:100:0` で取得できる

```shell
curl -H 'Authorization: Bearer <auth_token>' https://sentry.io/api/0/projects/{organization_slug}/{project_slug}/issues/?cursor=0:100:0'
```
