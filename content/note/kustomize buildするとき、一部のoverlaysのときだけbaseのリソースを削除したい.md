---
title: kustomize buildするとき、一部のoverlaysのときだけbaseのリソースを削除したい
date: 2023-02-27T12:21:00+09:00
tags:
- 2023/02/27
- Kubernetes
lastmod: 2023-02-27T12:21:00+09:00
---

[【kustomize】特定の環境だけbaseのリソースを削除する | amateur engineer's blog](https://amateur-engineer-blog.com/remove-resouce-kustomize-base/)

baseのapiVersionと一部環境だけ異なるという場合に必要となる

base/hpa.yaml

````yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
````

overlays/stg/hpa.yaml

````yaml
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
````

これでkustomize build すると、v1とv2beta1両方が作られてしまう。

````yaml
---
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
---
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
````

これを回避するため、 `patch: $delete` でファイルを削除する

`delete-hpa-v1.yaml`

````yaml
$patch: delete 
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
````

`base/kustomization.yaml`

````yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
- hpa.yaml
````

`overlays/stg/kustomization.yaml`

````yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: app-stg

resources:
- ./../../base

patchesStrategicMerge:
  - delete-hpa-v1.yaml
````
