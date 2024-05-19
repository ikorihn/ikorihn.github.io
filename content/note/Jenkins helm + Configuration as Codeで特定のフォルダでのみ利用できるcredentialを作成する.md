---
title: Jenkins helm + Configuration as Codeで特定のフォルダでのみ利用できるcredentialを作成する
date: 2024-05-15T15:32:00+09:00
tags:
  - Jenkins
---

一つの [[Jenkins]] サーバーを複数のグループで共有しているときに、チームA用のCredentialをチームBには使わせたくない場合があります。
credentialを普通に作成するとGlobalに作成されて、どのジョブからでも利用できてしまいます。

特定のフォルダ配下にあるジョブだけに利用を制限するために、 [Folders plugin](https://plugins.jenkins.io/cloudbees-folder/)  の機能を利用します。

- Jenkins 2.440.3
- Configuration as Code Plugin 1775.v810dc950b_514
- Job DSL Plugin 1.87
- Folders Plugin 6.940.v7fa_03b_f14759

## GUIから設定する場合

フォルダを開いて、サイドバーの `Credentials` > `Stores scoped to <folder>` からCredentialを追加します。
そうするとこのフォルダでのみ利用できるcredentialが作成できます。

![[Pasted-image-20240515041850.png]]

![[Pasted-image-20240515041941.png]]

## Job DSL + Confiuration as Codeで設定する

<https://your.jenkins.installation/plugin/job-dsl/api-viewer/index.html> でJob DSLのリファレンスを開いて、 `folderCredentialsProperty` の項目を開くとfolderへのcredentialの設定方法がわかります。

リファレンスからはsecret textやsecret fileの設定方法がわからなかったのですが、 [Create a folder credential of type "secret file" and "secret text" with Job DSL - Using Jenkins / Ask a question - Jenkins](https://community.jenkins.io/t/create-a-folder-credential-of-type-secret-file-and-secret-text-with-job-dsl/12509) によると `stringCredentialsImpl` で設定できるようです。

ポイントは `hudson.util.Secret.fromString` でJenkins用の暗号化を施してから保存することです

```yaml
jobs:
  - script: >
      folder('MyFolder') {
          properties {
              folderCredentialsProperty {
                  domainCredentials {
                      domainCredentials {
                          domain {
                              name('myfolder')
                              description("このフォルダのみで使用できるcredential")
                          }
                          credentials {
                              stringCredentialsImpl {
                                  scope("GLOBAL")
                                  id("test-credential")
                                  description("")
                                  secret(hudson.util.Secret.fromString("the-secret"))
                              }
                          }
                      }
                  }
              }
          }
      }
```

## helm + Configuration as Codeで設定する

[Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts) を使って [[Kubernetes]] で構築している場合は次のようにします。

helmの `values.yaml` に次のようにSecretから取得した値が設定されているとして、 `${name-keyName}` の形式でそのsecretの値に置き換えることができます。

```yaml:title=values.yaml
controller:
  additionalExistingSecrets:
    - name: github_secret
      keyName: github_user
    - name: github_secret
      keyName: github_password
    - name: github_secret
      keyName: name

  JCasC:
    configScripts:
      job-dsl: |-
        jobs:
          - script: >
              folder('MyFolder') {
                  properties {
                      folderCredentialsProperty {
                          domainCredentials {
                              domainCredentials {
                                  domain {
                                      name('myfolder')
                                      description("このフォルダのみで使用できるcredential")
                                  }
                                  credentials {
                                      stringCredentialsImpl {
                                          scope("GLOBAL")
                                          id("test-credential")
                                          description("")
                                          secret(hudson.util.Secret.fromString("${github_secret-name}"))
                                      }
                                      usernamePassword {
                                          scope("GLOBAL")
                                          id("test-user-pass")
                                          description("GitHub username password")
                                          username("${github_secret-github_user}")
                                          password(hudson.util.Secret.fromString("${github_secret-github_password}"))
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
```

## おわりに

- Folder pluginの機能でフォルダ配下限定のcredentialを作成できる
- Configuration as CodeでもJob DSLと組み合わせることで、少しトリッキーな見た目になるが実現できる

## 参考

- [Folder credentials and its chicken-and-egg problem · Issue #782 · jenkinsci/configuration-as-code-plugin](https://github.com/jenkinsci/configuration-as-code-plugin/issues/782)
- [How to restrict credentials in Jenkins? - Stack Overflow](https://stackoverflow.com/questions/29112679/how-to-restrict-credentials-in-jenkins)
- [Restrict credentials access using credentials domains in Jenkins - Using Jenkins - Jenkins](https://community.jenkins.io/t/restrict-credentials-access-using-credentials-domains-in-jenkins/13152)
