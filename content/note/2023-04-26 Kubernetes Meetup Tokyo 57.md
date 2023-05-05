---
title: 2023-04-26 Kubernetes Meetup Tokyo 57
date: 2023-04-26T20:01:28+09:00
tags:
- 2023/04/26
- meetup
lastmod: 2023-04-30T23:04:13+09:00
---

## Pod Security Policy をやめて Gatekeeper に移行

* PSP - [Kubernetes](note/Kubernetes.md) 組み込みのセキュリティ機構機構
  * セキュリティポリシーを定義し、Podリソースのspecをポリシに適合するよう変更、適合するポリシがないPodの作成を拒否
  * 例 HostPathを使う場合にrootではないUID/GIDを強制する
* 挙動がわかりにくい
  * RBACで権限を制限するのだが、ソースが複数となる
  * "Pod作成者(kubectl applyする人、Deploymentリソースなどのコントローラ)"、または "Podに紐づくServiceAccount" がuseできるPSP
  * 複数のPSPがある場合は複雑なルールでどれが適用されるか決まる
  * [Kubernetes](note/Kubernetes.md)  v1.25で削除された
* [Gatekeeper](note/Gatekeeper.md) または Kyverno という選択肢がある
  * Gatekeeper でセキュリティポリシーの作成には Gatekeeper Library が利用できる
* PSPの場合
  * 各Podに1つのPSPが適用され、ポリシの内容がまとまっている
  * どのPSPが適用されたかがannotationでわかる
  * Pod specのmutationをしてくれるのが便利だが暗黙的
  * Gatekeeper ではpodの属性ごとに制約が別々のリソースに分かれる
* Gatekeeperで制約リソースをまとめてポリシを構成
  * ポリシ内の制約リソースはすべて同じセレクターを持つ
  * 各Podには1つのポリシが適用され、ポリシ内に制約リソースがまとまっている
  * Podのラベルにどのポリシが適用されるか明示され、pod側からポリシを指定する形に
* Gatekeeperはmutationが可能で、Assignなどのカスタムリソースで明示的に指定可能

## MercariにおけるKubernetes

GKEをつかっている

### Cluster Autoscalerのはなし

GKEでは、積極的にNodeを削除してコスト削減するか、Nodeをあまり消さないで耐障害性を高めるかを選べる。
Podもつめつめで起動させるか、なるべく少なくスケジューリングするかを選べる。 

Nodeにあきがなさすぎるのを防ぐ
overprovisioning Pods = 低いPriorityのPodがPreemptされて他のPodが優先的に起動するようにする

### HorizontalPodAutoscaler

`type: Resource` の場合、複数コンテナが乗っているpodでは個々のコンテナのresource utilizationではなくPod全体のを使用するので、あるコンテナがリソースかつかつになってもスケーリングされない場合がある

`type: ContainerResource` というのもあるがまだalphaなので、開発推進したり、
自前で Datadog Metrics を使って代替にしている

VerticalPodAutoscaler も活用している
Slack botで、リソースこんだけ余っているのでもう少し下げれますよっていうのを通知している

### Workload optimization

マイクロサービスで上流のサービスがしんだとき、下流のリクエストが減ってPodがscale in
-> 上流が復活したときに一気にトラフィックが流れて下流がしぬ

minReplicaを高めにしておけばいいが、HPAのメリットもなくなる

DatadogMetricsを使って、1週間前の同じ時間のレプリカ数の1/2のレプリカ数をsuggestするようにして、最低限を担保できる
これによりminReplicaも少なくできた

#### HPAのtarget Utilizationを決めるのがむずい

targetのUtilizationを70~80%にしているけど余らせている理由は？

* あるコンテナは使用量少なくてもほかが100%近いって場合があるので平均とって70%くらい
* スケールアウトの時間稼ぎ Nodeやコンテナの起動時間がかかるから 

それぞれのケースを考慮してutilization

https://github.com/mercari/tortoise を作っている
Deploymentを指定するだけで、HPA、VPA、resourceの設定をすべていい感じにやってくれる
まだ検証段階だが今後に期待
