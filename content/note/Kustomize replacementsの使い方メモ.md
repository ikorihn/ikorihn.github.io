---
title: Kustomize replacementsの使い方メモ
date: 2024-01-23T15:28:00+09:00
tags:
  - Kubernetes
---

[[Kustomize]] にて特定のリソースの一部分に変数を埋め込みたいときに、 かつては `vars` を使用していたが、kustomize v3.9  あたりからdeprecatedになり `replacements` を使用するよう警告が出るようになった。
`vars` とは結構書き方が変わるので使い方をメモする。

## 公式ドキュメント

https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/replacements/

## 試してみる

```yaml file:deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myhello
spec:
  selector:
    matchLabels:
      name: myhello
  replicas: 1
  template:
    metadata:
      labels:
        name: myhello
    spec:
      containers:
        - name: myhello
          image: myhelloimage:0.0.1
          env:
            - name: MY_KEY
              value: SHOULD_BE_REPLACED
```

```yaml file:configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: application-cm
data:
  MY_VALUE: hoge
```

```yaml file:kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
replacements:
  - source:
      kind: ConfigMap
      name: application-cm
      fieldPath: data.SECRET
    targets:
      - select:
          kind: Deployment
          name: myhello
        fieldPaths:
          - spec.template.spec.containers.[name=myhello].env.[name=MY_KEY].value

resources:
- deployment.yaml
- configmap.yaml
```

`kustomize build` すると期待通り、envの値が無事書き換わる。

```yaml
apiVersion: v1
data:
  MY_VALUE: hoge
kind: ConfigMap
metadata:
  name: application-cm
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myhello
spec:
  replicas: 1
  selector:
    matchLabels:
      name: myhello
  template:
    metadata:
      labels:
        name: myhello
    spec:
      containers:
      - env:
        - name: MY_KEY
          value: hoge
        image: myhelloimage:0.0.1
        name: myhello
```

## 一部のリソースだけ適用しない

すべてのDeploymentリソースに適用する、ただし特定のリソースにだけ適用したくないといった指定もすることができる。
`targets.reject` に除外したい条件を書く。

```yaml file:kustomization.yaml
replacements:
  - source:
      kind: ConfigMap
      name: application-cm
      fieldPath: data.SECRET
    targets:
      - select:
          kind: Deployment
        reject:
          - kind: Deployment
            name: newworld
        fieldPaths:
          - spec.template.spec.containers.[name=myhello].env.[name=MY_KEY].value

```
