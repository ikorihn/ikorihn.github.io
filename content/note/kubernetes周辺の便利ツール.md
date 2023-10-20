---
title: kubernetes周辺の便利ツール
date: 2022-12-11T23:47:00+09:00
tags:
- Kubernetes
lastmod: 2022-12-11T23:48:00+09:00
---

[ワイがお世話になっているKubernetes関連のツール達 - 守りたい、この睡眠時間](https://tomioka-shogorila.hatenablog.com/entry/2020/03/10/230206)
[Kubernetesを使う上で知っておきたいツールやプラグイン](https://zenn.dev/tmrekk/articles/580f2e2bb39d5f)o
[kubectlのプラグイン機構とおすすめプラグインのご紹介 〜 Kubernetes制御用コマンド \#k8sjp - Yahoo! JAPAN Tech Blog](https://techblog.yahoo.co.jp/entry/2020081830014718/)

## [Krew](note/Kubernetes%20Krew.md)

https://github.com/kubernetes-sigs/krew/

kubectl用のプラグイン管理

インストールはこちら
https://krew.sigs.k8s.io/docs/user-guide/setup/install/
アップデートは自身

````shell
kubectl krew update
````
