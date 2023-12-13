---
title: Cloud Native Days in Tokyo 2023
date: 2023-12-11T13:42:00+09:00
tags:
- conference
---

## noteのKubernetes移行

* [Argo Workflows](Argo%20Workflows.md) を使って非同期処理を実行
* Distributed Load Testing on AWSをつかって負荷試験
  * 既存のEC2環境と同等の性能を出すにはどのような設定のPodがどれくらい必要かを算出
  * いきなり本番同等のリクエスト量を投げるのではなく小さく初めて、ボトルネックになっている箇所をしっかり探りチューニングしつつ最終的に本番の流量をさばけるようにした
* CloudFront Continuous Deployment
* [Karpenter](note/Karpenter.md) より柔軟なオートスケーリング
* 「EKSのバージョンアップ大変ですよね」
  * マネージドNodeGroupを利用していたときはグループごとにバージョンアップして、関連リソースもバージョンアップ、1習慣くらいかかっていた
  * Karpenterにしたあとは、ControlPlaneはin-placeにした。NodeのバージョンはKarpenterによって自動で上がる
* ステージング環境を即時に構築できる仕組みを構築

## 計測の手間を省きたい！OpenTelemetry に見る”自動計装”のイマ

* オブザーバビリティ
* テレメトリー = ログ、メトリクス、トレース
* テレメトリを収集するには計装(instrumentation)が必要
* O'REILLYの「オブザーバビリティ・エンジニアリング」読もう
* [OpenTelemetry](OpenTelemetry.md) で計装すれば、対応しているサービスであれば収集できる
  * 特定のモニタリングサービスのSDKを使って実装すると、そのサービスにしか送信できない
* トレース、メトリクス、ログ
* OpenTelemetry のエコシステムで様々な言語、ツール向けの計装ライブラリを提供している
  * GoのEcho用とか、net/http用とかPostresQL用とか
* 自動計装めっちゃ便利
* 手動のほうがもちろんカスタマイズは効く
* Pythonを実行するときに `opentelemetry-instrument python app.py` で実行すれば自動計装されたコードが実行される
* まずは自動計装で感触を試してオブザーバビリティが浸透してから、足りない場合は手動計装する
* [Go](note/Go.md) の自動計装はまだwork in progress。今はみんな手動で頑張っている
  * ネイティブコードにコンパイルされるため実行時に埋め込むのが難しい。*eBPF* で頑張ろうとしている
  * 計装エージェントのコンテナに対して特権を与える必要があるため注意が必要
* [Kubernetes](note/Kubernetes.md) OpenTelemetry Operatorを使って簡単にアプリケーションへ自動計装を行う
  * Admission WebhookのMutatingを利用して、自動計装ツールをサイドカーに埋め込む
  * injectしたいPodにはannotationを書くと自動計装される

## FinOps! Karpenterによるk8sコスト削減への道

* [Karpenter](note/Karpenter.md) 
  * 必要なリソースだけを作成する
  * Spot instanceのターミネーション2分前の通知を受け取って、別のNodeに退避する
* EC2 instance 購入方法
  * on-demand, spot, saving plans, reserved instance
* Karpenter はon-demandとspotだけサポートしていて、割引プランに付いては考慮されていない
  * savings plansでt3.largeを0.047/hで契約したとする
  * 通常はt3.largeは0.09, c5.largeは0.04くらい
  * Karpenterはsavings plansのコストでは計算してくれないので、c5.largeのほうが安いと判断してしまう
  * spotも同様で、spotのほうが安いって判定でこっちが作成されてしまうとsavings planが使われないので契約だけしていて使ってない状態
* savings planの利用率をリアルタイムに取れるAPIが存在しない
  * Cost Usage ReportからSavings Planの利用情報を取得して、Node Poolの重み付けを変更する機能を自作
  * Savings Planのノードが100%使われていない場合はNode poolのWeightを変えることでSavings Planが優先的に利用されるようにして、使い切ったら再度Spot instance
* 安さだけを求めるのではなくて運用効率化や可用性のバランスを取ったコスト最適化を目指す
