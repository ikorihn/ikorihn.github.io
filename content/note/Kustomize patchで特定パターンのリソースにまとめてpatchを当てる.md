---
title: Kustomize patchで特定パターンのリソースにまとめてpatchを当てる
date: 2023-04-07T16:59:00+09:00
tags:
- 2023/04/07
- Kubernetes
lastmod: 2023-04-07T16:59:00+09:00
---

patch で複数のリソースにまとめて変更を加えたい場合に使える

````
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- github.com/argoproj/argo-cd/manifests/cluster-install?ref=v2.5.0

patches:
  - patch: |-
      kind: any
      metadata:
        name: any
      spec:
        template:
          spec:
            nodeSelector:
              ap-type: argocd-node
    target:
      kind: (StatefulSet|Deployment)
````
