---
title: Argo Rollouts BlueGreen Deploy中にreplicasが変更された場合に正常に完了しない
date: 2023-08-09T10:46:00+09:00
tags:
- 2023/08/09
- Kubernetes
- ArgoCD
---

## 環境

* Argo Rollouts v1.5.1

## 再現手順

* Blue/Green Deployを設定する
* Rolloutsに対してHPAを設定して、replicasがHPAによって管理されるようにする
* Rolloutsのcolorを変更してDeployを実行する
* postAnalysisが実行されている間にHPAのスケールが実行される
* postAnalysisが完了しても、以前のカラーがスケールインせず、両方のカラーが起動状態になるos
