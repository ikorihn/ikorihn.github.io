---
title: Kubernetes configMapGeneratorを使う
date: "2022-11-08T16:08:00+09:00"
tags:
  - 'Kubernetes'
lastmod: "2022-11-08T16:08:00+09:00"
---

#Kubernetes

[[Kustomize]] の場合、ConfigMapを直接指定する代わりにconfigMapGeneratorを使用して作成できる

<https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/>
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/configGeneration.md

- literals: key-valueを指定する
- files: ファイルを指定する

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namePrefix: dev-
commonLabels:
  env: dev
resources:
- ./../../base
configMapGenerator:
- name: config-file
  files:
  - application.yaml
- name: the-map
  literals:
    - altGreeting=Good Morning!
    - enableRisky="false"
```

