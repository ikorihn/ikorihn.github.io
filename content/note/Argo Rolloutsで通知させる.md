---
title: Argo Rolloutsで通知させる
date: 2023-02-28T14:19:00+09:00
tags:
- 2023/02/28
- Kubernetes
lastmod: 2023-02-28T14:19:00+09:00
---

* argo-rollouts 1.4.0 で、デプロイ失敗時にslack通知が来なかった
* argo-rolloutsのバージョンを以前の1.2.1に戻してもslack通知がこないのでアップデート起因ではない。
* 「エラーになったカラーのPodが落ちてくれない」みたいなことがconfluenceに書いてあったが、落ちてくれてそう。0.10.2時点の調査内容っぽいので今は挙動が変わったか
* argocd-notificationsのApplicationが残っていてややこしかったので削除しよう
* <https://argocd-notifications.readthedocs.io/en/stable/triggers/#avoid-sending-same-notification-too-often> 通知減らしたいなあ
* `manifest/argocd/install/overlays/prod/appproject.yaml` で `notifications.argoproj.io/subscribe.` に `on-degraded` が設定されていないから通知こないんだな

## Argo CD Notifications

https://argocd-notifications.readthedocs.io/en/stable/

* 以前はArgo CDとは別でNotifications用のhelmをインストールしていたが、現在はArgo CD本体のhelmに取り込まれている
* Triggerは、自分で `argocd-notifications-cm` ConfigMapに `trigger.on-XXX` の形で定義する
  * カタログがこちらに https://argocd-notifications.readthedocs.io/en/stable/catalog/
* statusがDegradedになったらargocd-notificationsで通知が来るよう設定するには、Triggerを作ってApplicationのsubscriptionに登録する

````
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  annotations:
    notifications.argoproj.io/subscribe.on-sync-succeeded.slack: my-channel1;my-channel2
    notifications.argoproj.io/subscribe.on-degraded.slack: my-channel1;my-channel2
````

### ConfigMap

https://github.com/argoproj/argo-rollouts/blob/master/manifests/notifications-install.yaml
こちらをインポートし、 `argo-rollouts-notification-configmap` ConfigMapでtriggerやtemplateを設定する

overlaysや、上記yamlをダウンロードして追記する形でslackのトークンを設定する

````yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argo-rollouts-notification-configmap
data:
  service.slack: |
    token: $slack-token
---
apiVersion: v1
kind: Secret
metadata:
  name: argo-rollouts-notification-secret
stringData:
  slack-token: <my-slack-token>
````

Rolloutのannotationsに、subscribeを設定する

````yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: solr
  annotations:
    notifications.argoproj.io/subscribe.on-analysis-run-error.slack: "#bot_alert"
    notifications.argoproj.io/subscribe.on-analysis-run-failed.slack: "#bot_alert"
    notifications.argoproj.io/subscribe.on-analysis-run-running.slack: "#bot_alert"
    notifications.argoproj.io/subscribe.on-rollout-aborted.slack: "#bot_alert"
    notifications.argoproj.io/subscribe.on-rollout-completed.slack: "#bot_info"
    notifications.argoproj.io/subscribe.on-rollout-paused.slack: "#bot_info"
    notifications.argoproj.io/subscribe.on-rollout-step-completed.slack: "#bot_info"
    notifications.argoproj.io/subscribe.on-rollout-updated.slack: "#bot_info"
spec:
````
