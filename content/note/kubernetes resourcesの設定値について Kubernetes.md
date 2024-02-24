---
title: kubernetes resourcesの設定値について Kubernetes
date: "2023-01-23T17:35:00+09:00"
tags:
  - '2023/01/23'
  - 'Kubernetes'
---

<https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/>
[Kubernetes のリソース制限とその挙動確認 - YasuBlog](https://dunkshoot.hatenablog.com/entry/kubernetes_manage_resource)

- requestsに `memory: 256MiB` を設定すると256MiB以上空きがあるNodeにスケジュールされて、256MiB以上使用する可能性がある
- limitsに `memory: 4GiB` を設定すると、4GiB以上のメモリを利用しようとするとOOM KillerによりPodが落とされる
- resourcesのrequestsに指定されたmemory,cpuの値を元にスケジュール先のNodeを選択する

## limits

limitsの値を超えた場合の挙動について

- memoryを超えた場合: OOM KillerによりPodが強制終了
- cpuを超えた場合: 強制終了はしないがCPU速度が遅くなる

limits はNodeのallocatableなリソース量を超えて指定することができる。

## オーバーコミット

オーバーコミットは、コンテナの limits の合計を Node の割当可能リソース量より大きくすること
例えばメモリ2GBのNodeには、requests 0.5GB, limits 1GB の Pod を4個起動できる。limits の合計は 4GB となりオーバーコミットの状態だが、Pod が常に最大値使うわけではない場合には許容できる。
負荷が高まって全Podがlimitsぎりぎりまでリソースを使うようになると、Nodeの割当可能リソースを超過してしまう。
こうなると、Eviction Managerによりもっともrequestsを超過してリソースを使用しているPodがEvictされる。

オーバーコミットさせるとPodの集約率は上がるがPodの稼働率は下がる可能性がある。
逆にrequestsとlimitsを近づけすぎると、Podの集約率は下がってリソース効率は悪くなるが稼働は安定する。


## CPU

2 vCPUのEC2インスタンスのCPUをフルで使いたい場合は `cpu: 2` と記載する。
1 vCPU分のリソースの場合は `cpu: 1` または `cpu: 1000m` と書く。
(1 CPU = 1000m)

## メモリ

バイト単位で書く(1024000, 1Gi、256Mなど)


## PrometheusでPodのCPU、メモリ使用率を確認する

kubectl topコマンドでもできるがPrometheusの場合

[K8s Monitor Pod CPU and memory usage with Prometheus | by Kim Wuestkamp | ITNEXT](https://itnext.io/k8s-monitor-pod-cpu-and-memory-usage-with-prometheus-28eec6d84729)

### CPU

```
# container usage
rate(container_cpu_usage_seconds_total{pod=~"compute-.*", image!="", container_name!="POD"}[5m])

# container requests
avg(kube_pod_container_resource_requests_cpu_cores{pod=~"compute-.*"})

# container limits
avg(kube_pod_container_resource_limits_cpu_cores{pod=~"compute-.*"})

# throttling
rate(container_cpu_cfs_throttled_seconds_total{pod=~"compute-.*", container_name!="POD", image!=""}[5m])
```

### Memory

```
# container usage
container_memory_working_set_bytes{pod_name=~"compute-.*", image!="", container_name!="POD"}

# container requests
avg(kube_pod_container_resource_requests_memory_bytes{pod=~"compute-.*"})

# container limits
avg(kube_pod_container_resource_limits_memory_bytes{pod=~"compute-.*"})
```



[How to display Kubernetes request and limit in Grafana / Prometheus properly](https://gist.github.com/max-rocket-internet/6a05ee757b6587668a1de8a5c177728b)

```
sum(rate(container_cpu_usage_seconds_total{pod=~"jenkins-agent-.*", image!="", container!="POD"}[5m])) by (pod, container, namespace) / sum(kube_pod_container_resource_requests{resource="cpu", unit="core", pod=~"jenkins-agent-.*", container!="POD"}) by (pod, container, namespace)
sum(rate(container_cpu_usage_seconds_total{pod=~"jenkins-agent-.*", image!="", container!="POD"}[5m])) by (pod, container) / sum(container_spec_cpu_quota{pod=~"jenkins-agent-.*", image!="", container!="POD"}/container_spec_cpu_period{pod=~"jenkins-agent-.*", image!="", container!="POD"}) by (pod, container)
```
