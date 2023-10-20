---
title: Jenkins-job-dslで少しだけ違うジョブをまとめて定義する
date: 2022-03-07T17:45:00+09:00
tags:
- Jenkins
lastmod: 2022-03-07T17:45:00+09:00
---

[Jenkins Job DSL Plugin](note/Jenkins%20Job%20DSL%20Plugin.md) で環境ごとにジョブが分かれていて微妙にパラメータが異なる場合や、異なるサービスで似たジョブを複製したいときはままあると思いますが。
GUI上でぽちぽちするのは時間がかかるし間違えるので、Jenkinsサーバーに入ってconfig.xmlをコピーして書き換えるみたいなことをやったりしますが、
[Jenkins Job DSL Plugin](note/Jenkins%20Job%20DSL%20Plugin.md) を使うとこの問題が解決します。

類似: [Jenkins JobDSLでclosure内からfunctionを呼ぶ](jenkins%20JobDSL%E3%81%A7closure%E5%86%85%E3%81%8B%E3%82%89function%E3%82%92%E5%91%BC%E3%81%B6.md) 

## Groovyスクリプトでジョブを作成する

[Jenkins Job DSL Plugin](note/Jenkins%20Job%20DSL%20Plugin.md) は結局Groovyなので、ある程度自由に記述ができます。
配列を定義して、異なる部分だけを変数にするといったやり方で、見通しもよく複製することができます。

さっそくpipelineJobを作ってあげましょう

````groovy
def services = [
  'service-A',
  'service-B',
]

services.each { service ->
  pipelineJob("build/${service}") {
    definition {
      cps {
        script(pipelineTemplate(service))
        sandbox()
      }
    }

  }
}

def pipelineTemplate(String service) {
  def repositoryUrl = "https://~~~~/${service}.git"
  return '''
    pipeline {
      options {
        ansiColor('xterm')
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '5')
        timestamps()
      }

      parameters {
        listGitBranches(
            name: 'BRANCH_TAG',
            defaultValue: 'master',
            branchFilter: '.*',
            credentialsId: "",
            quickFilterEnabled: true,
            remoteURL: '#repositoryUrl',
            selectedValue: 'DEFAULT',
            sortMode: 'ASCENDING_SMART',
            tagFilter: '*',
            type: 'PT_BRANCH_TAG'
        )
      }

      stages {
        stage('git clone') {
          steps {
            script {
              currentBuild.description = "#service - ${params.BRANCH_TAG}"
              checkout([
                  $class                           : 'GitSCM',
                  branches                         : [[name: "${params.BRANCH_TAG}"]],
                  userRemoteConfigs                : [
                      [url: "#repositoryUrl"],
                  ]
              ])
            }
          }
        }

      }
    }
    '''.stripIndent()
      .replaceAll('#service', service)
      .replaceAll('#repositoryUrl', repositoryUrl)

}

````

なおここではpipelineを文字列で直接書いていて、pipeline内のparameter(`params.XXXX`)とGroovyの変数がうまく共存できなかったためGroovyの変数は `replaceAll` で置換をかけるようにしています

[Jenkins Job DSL Plugin](note/Jenkins%20Job%20DSL%20Plugin.md) は公式でPlaygroundが用意されているので、まずはこちらで試すのがよいでしょう。
https://job-dsl.herokuapp.com/

手元で実行するのも可能です
https://github.com/jenkinsci/job-dsl-plugin

### 参考

[ もしJenkinsでちょっとずつ違う100のジョブを管理しなくてはいけなくなったら - knjnameのブログ](https://knjname.hateblo.jp/entry/2015/01/06/025459)
