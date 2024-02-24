---
title: apigw_lambda知見
date: "2020-11-07T17:35:00+09:00"
tags:
  - AWS
  - Lambda
lastmod: '2021-05-30T18:10:06+09:00'

---

-   lambda
    -   endpointをpathごとに作る
        -   main関数のみエンドポイントごとに準備
        -   handler関数は共通
        -   handlerの中でpathごとに振り分け
    -   endpointは一つのlambda
        -   中でGinなどを使ってrouting
        -   Ginを使わなくても単にrequest.pathで分岐処理書けばいいだけ？便利な機能が使える利点があるかもしれない
        -   Ginを使わないのであれば、mainが一個になるか複数になるかの違いだけになる
        -   endpoint一個だと、同時実行数の制限が懸念
