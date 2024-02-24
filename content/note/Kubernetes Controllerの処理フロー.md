---
title: Kubernetes Controllerの処理フロー
date: "2023-08-14T12:27:00+09:00"
tags:
  - '2023/08/14'
  - Kubernetes
lastmod: '2023-08-14T12:27:58+09:00'
---


## 用語の整理

### client-go

KubernetesのAPIを実行するGoモジュール

https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md

## 参考資料

- [client-goを使ってKubernetesのAPIに触れた - なになれ](https://hi1280.hatenablog.com/entry/2020/01/28/191029)
- [ゼロから始めるKubernetes Controller / Under the Kubernetes Controller - Speaker Deck](https://speakerdeck.com/govargo/under-the-kubernetes-controller-36f9b71b-9781-4846-9625-23c31da93014?slide=44)
- [client-go Work Queueを理解する. client-go をひたすら触っているので、そのアウトプットをしていきます。 | by wqwq | Medium](https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22)
