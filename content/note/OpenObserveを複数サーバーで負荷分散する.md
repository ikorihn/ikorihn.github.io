---
title: OpenObserveを複数サーバーで負荷分散する
date: 2023-06-29T18:34:00+09:00
tags:
- 2023/06/29
- Observability
lastmod: 2023-06-29T18:38:48+09:00
---

[OpenObserveを使ってみる](note/OpenObserveを使ってみる.md) で、ローカルで立てたり1台のEC2上で動かす手順がわかった。
負荷分散したい場合いまのところ[Kubernetes](note/Kubernetes.md)前提となっているのだが、k8s自体の運用も大変なのでEC2同士で通信したい。

## HA構成でノード同士で通信する仕組み

OpenObserveは起動時に環境変数 `ZO_NODE_ROLE` の値を元に自身の役割を決めている。
起動時に [etcd](note/etcd.md) に自身の情報を登録している。
`etcdctl get '/zinc/observe/nodes' --prefix | awk '{if (NR%2) ORS="\t"; else ORS="\n"; print}'`
で確認できる。
