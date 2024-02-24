---
title: kube-prometheus-stack のCRDがToo longで作られない
date: "2023-03-09T23:47:00+09:00"
tags: 
    - 2023/03/09
    - Kubernetes
    - Prometheus
---

Argo CD v2.5からは、server side applyを有効にすると `Too long: must have at most 262144 bytes` が解消される。将来的にデフォルトがserver side applyになるということらしい
kube-prometheus-stackにはこちらつけておくといい
[https://www.arthurkoziel.com/fixing-argocd-crd-too-long-error/](https://www.arthurkoziel.com/fixing-argocd-crd-too-long-error/)

https://github.com/prometheus-community/helm-charts/issues/579

しかしServerSideApply=trueにしてsyncしたところエラーがでた(server side applyは関係ないような気がする、たまたまタイミングでは)
`Prometheus.monitoring.coreos.com "monitoring-prometheus" is invalid: spec.shards: Invalid value: "null": spec.shards in body must be of type integer: "null"`

https://github.com/prometheus-community/helm-charts/issues/579 でnullを指定するといいっていうのが反映されていた。
デフォルト値の `shards: 1` でもnullのときと変わらないようなので、null指定を消した
https://github.com/prometheus-community/prometheus-operator/blob/f20fd9c4e6912ab63497648032ca2aa6684923a2/pkg/prometheus/statefulset.go#L82
