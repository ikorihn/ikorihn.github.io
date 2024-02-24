---
title: Kubernetes 利用中のコンテナイメージ一覧を出力する
date: "2023-09-01T17:00:00+09:00"
tags:
  - Kubernetes
---

[[Kubernetes]]上で利用されているコンテナイメージの一覧を取りたい。

公式にやり方が紹介されているが、こちらはPodのみ対象となっているので、Jobなどが含まれない。
https://kubernetes.io/docs/tasks/access-application-cluster/list-all-running-container-images/

そこで次のようにした。

```shell
function list_images() {
  kubectl get all -A -o jsonpath='{range .items[*]}{..image}{"\n"}{end}' | tr -s '[[:space:]]' '\n'
  kubectl get crds -o=jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | xargs -i kubectl get {} -A -o jsonpath='{range .items[*]}{..image}{"\n"}{end}' | tr -s '[[:space:]]' '\n'
}

list_images | sort -u
```

ポイント

- `get all` でPod以外のリソースも対象にする
- `get all` ではCustom Resourceが含まれていないため、それら一つ一つに対しても実行する

リソースの数が多いと時間はかかってしまうが、多分これが確実だと思います

[[Kubectl さまざまな出力形式]]
