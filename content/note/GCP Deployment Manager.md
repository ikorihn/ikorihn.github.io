---
title: GCP Deployment Manager
date: "2023-02-03T15:49:00+09:00"
tags:
  - '2023/02/03'
  - 'GCP'
---

AWSのCloudFormationみたいなもの
設定ファイルに従ってリソースが作成される

[Deployment Manager の最初の一歩 - Qiita](https://qiita.com/yhiraki/items/646d015caa3d5a1c2e6b)

サポートされるリソースの一覧
<https://cloud.google.com/deployment-manager/docs/configuration/supported-resource-types>

リンクから飛ぶと設定できるパラメータがJSON Schemaで確認できる

NodePoolの定義を確認したければこちら
https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters.nodePools

config は [NodeConfig](https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/NodeConfig) というようにリンクをたどっていく
