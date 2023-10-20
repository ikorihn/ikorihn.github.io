---
title: Jenkins helm SecretsManagerからSecretを取得してセットする
date: 2022-09-13T12:39:00+09:00
tags:
- Jenkins
- Kubernetes
---

`additionalExternalSecrets` を使うのがよさそう
<https://github.com/jenkinsci/helm-charts/tree/main/charts/jenkins#additional-secrets>

`additionalSecrets` は3.3.1で追加されている
<https://github.com/jenkinsci/helm-charts/commit/f6316c95d264dbf064d0c3cc51836b364650273e>

ドキュメントもこのタイミングで更新されている。
<https://github.com/jenkinsci/helm-charts/commit/6773a7ff4868a579f54fd6f57d01e2fd3b81e6e6>

以前の書き方だと、`volumes` でsecretsを設定して、`mounts` で `/run/secrets/${KEY}` で配置するというのを自分で行っていた
<https://github.com/jenkinsci/configuration-as-code-plugin/blob/master/docs/features/secrets.adoc#kubernetes-secrets>

`additionalSecrets` がExternalSecretsの変更に追従されるようなPRもマージされている(4.x)
[https://github.com/jenkinsci/helm-charts/pull/645](https://github.com/jenkinsci/helm-charts/pull/645)

## その他

<https://jenkinsci.github.io/kubernetes-credentials-provider-plugin/>

[5 ways to inject secrets from AWS into Jenkins pipelines – Tom Gregory](https://tomgregory.com/inject-secrets-from-aws-into-jenkins-pipelines/)
AWS Secrets Manager Credentials Provider plugin というのもある
