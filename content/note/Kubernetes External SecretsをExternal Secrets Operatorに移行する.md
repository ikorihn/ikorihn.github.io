---
title: Kubernetes External SecretsをExternal Secrets Operatorに移行する
date: 2023-08-15T16:16:00+09:00
tags:
- 2023/08/15
- Kubernetes
lastmod: 2023-08-15T16:16:45+09:00
---

[Kubernetes External Secrets (KES)](https://github.com/external-secrets/kubernetes-external-secrets) は [Kubernetes](note/Kubernetes.md) において、AWS Secrets Managerなどの外部のシークレット管理システムと連携して、セキュアにSecretsリソースを作成するコンポーネント。

2021年に非推奨化が発表されて、2022年7月にアーカイブされている。
移行先として [External Secrets Operator (ESO)](https://github.com/external-secrets/external-secrets)  がアナウンスされている。
他にも同様の機能を提供するコンポーネントはあるが、移行コストが比較的小さそうなのでこちらにした。

## KESの仕組み

KESはExternalSecretリソースの内容をもとに、AWS Secrets Manager等外部システムに登録されている情報を取得し、[Secret](https://kubernetes.io/docs/concepts/configuration/secret/) リソースを作成する。
SecretはKubernetes標準のリソースなので、他のリソースから参照できる。

## ESOの仕組み

https://external-secrets.io/latest/introduction/overview/

Custom Resourceとcontrollerが、外部からシークレット情報を取得してSecretを作成する。外部システムの変更を監視し、reconcileする。

`SecretStore` リソースが、外部APIの定義と認証情報を持っているので、 `ExternalSecret` はどこから取ってくるのかは意識しない。

1. ESO は `ExternalSecret` の `spec.secretStoreRef` を使って適切な `SecretStore` を見つける。見つからなければ後続の処理は行われない
1. `SecretStore` から外部APIクライアントを生成
1. `ExternalSecret` に定義された情報を外部APIから取得
1. `ExternalSecret.target.template` の定義に従って `Kind=Secret` を作成する
1. 作成されたSecretは外部APIと同期される

### サポート

https://external-secrets.io/latest/introduction/stability-support/

* 最新の2つのマイナーリリースまでをサポートする
* 2-3ヶ月に一度マイナーリリースを行う
* つまり最新バージョンはおおよそ4-6ヶ月サポートされる

AWS Secrets Manager や GCP Secret Manager等はESO公式がサポートしているので安心できそう。

## 主な変更点

* SecretStore(ClusterSecretStore)の追加
* ExternalSecretのapiVersionが異なる

公式でKESからESOに移行するツールを用意しているので、これのManual Migrationを実行してどんな変更になるのかを概観するとわかりやすい。

{{< card-link "https://github.com/external-secrets/kes-to-eso" >}}

このツールには、KESからESOにmigrationしてそのままクラスターに反映させる機能もあるが、マニフェストを [Argo CD](Argo%20CD.md) で管理している都合上それをするとdiffが発生するため使わなかった。

## 手順

### ESOをインストール

[Helm](Helm.md)でインストールできる。
https://external-secrets.io/main/introduction/getting-started/

### SecretStoreを作成

````yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: secretstore-sample
spec:
  provider:
    aws:
      service: SecretsManager
      region: ap-northeast-1
      auth:
        secretRef:
          accessKeyIDSecretRef:
            name: awssm-secret
            key: access-key
          secretAccessKeySecretRef:
            name: awssm-secret
            key: secret-access-key
````

https://external-secrets.io/main/guides/multi-tenancy/

今回のユースケースでは、Shared ClusterSecretStoreが移行のコストが一番小さく済みそうなので、ClusterSecretStoreを作成することにする

### ExternalSecretを作成

````yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: example
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: secretstore-sample
    kind: ClusterSecretStore
  target:
    name: secret-to-be-created
    creationPolicy: Owner
  data:
  - secretKey: secret-key-to-be-managed
    remoteRef:
      key: provider-key
      version: provider-key-version
      property: provider-key-property
````

* `spec.target.name` を指定しない場合はExternalSecretと同じ名前で作成される
* ポーリングの間隔は、KESではDeploymentで設定していたが、ESOではExternalSecretの `spec.refreshInterval` で指定する

Secretの名前をKESとは別で作成すると、名前がバッティングすることなく簡単に作成でき、両方共存させることもできるので、参照している箇所を順次変更していくことで安全に変更できる。

Secretの名前を変えたくない場合は [kes-to-esoの手動マイグレーション](https://github.com/external-secrets/kes-to-eso#manual-migration) を参考に実施する。

1. ExternalSecretをapply
1. KESのreplicasを0にしてKESを停止させる
1. `apiVersion: kubernetes-client.io/v1` のExternalSecretで生成されたSecretリソースの `metadata.ownerReferences` を `apiVersion: external-secrets.io/v1beta1` のExternalSecretへ書き換える
   1.
