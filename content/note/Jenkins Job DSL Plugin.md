---
title: Jenkins Job DSL Plugin
date: 2022-03-07T18:52:00+09:00
tags:
- Jenkins
lastmod: 2022-03-25T16:36:00+09:00
---

[note/Jenkins](Jenkins.md) の設定やジョブをJob DSLという [Groovy](note/Groovy.md) のDSLで定義することができるようになる

<https://plugins.jenkins.io/job-dsl/>
<https://github.com/jenkinsci/job-dsl-plugin>

* 普通にプラグイン設定画面からインストール可能
* GroovyのDSLで、Jenkinsのジョブやフォルダを作成可能にする
* Groovyスクリプトなので、分岐や反復などを使って自由度高くジョブが作成できる
* DSLを基に、Jenkinsのジョブごとの設定ファイル(xml)を生成するようなイメージ
* [Playground](https://job-dsl.herokuapp.com/) や [コマンドライン](https://github.com/jenkinsci/job-dsl-plugin/wiki/User-Power-Moves#run-a-dsl-script-locally) でJenkinsに反映させるまえに実際どのようなXMLが生成されるか試すことができる
  * なおPlaygroundでは自分でいれたプラグイン(listGitBranchなど)はチェックすることができない

## DSLからジョブを作成する方法

1. Jenkinsジョブを作成
1. 設定でBuild stepに `Process Job DSL` があるので選択する
1. 手で直接入力したければ、 `Use the provided DSL script` にチェックを入れてDSLを入力
1. `Look on Filesystem` でサーバー上のファイルを指定することも可能
1. 設定完了したら保存して、ジョブを実行する

````groovy
folder('deplly') {
    description('Folder for deploy')
}

pipelineJob("deploy/server") {
    description("デプロイジョブ")
    parameters {
        stringParam("FILE", "exec.tar.gz", "デプロイするファイル名")
        gitParam('sha') {
            description('Revision commit SHA')
            type('REVISION')
            branch('master')
        }

    }

    throttleConcurrentBuilds {
        maxPerNode(1)
        maxTotal(1)
        throttleDisabled(false)
    }

    logRotator {
        numToKeep(5)
    }

    definition {
        cpsScm {
            scm {
                git {
                    configure { git ->
                        // sparse checkoutのようなオプションをつけたい場合
                        git / 'extensions' / 'hudson.plugins.git.extensions.impl.SparseCheckoutPaths' / 'sparseCheckoutPaths' {
                            'hudson.plugins.git.extensions.impl.SparseCheckoutPath' {
                                path('script')
                            }
                        }
                    }
                    remote {
                        url('ssh://git@bitbucket.org/workspace/slug.git')
                        credentials('bitbucket_credential')
                    }
                    branch('*/master')
                }
            }
            lightweight(false)
            scriptPath("Jenkinsfile")
        }
    }

}

````

````groovy
def REPOSITORY_URL = '<repository URL>'
def CREDENTIAL = '<credential>'
pipelineJob("deploy/server") {
    description("デプロイジョブ")
    parameters {
         listGitBranches {
             name("REVISION")
             description('git branch')
             remoteURL(REPOSITORY_URL)
             credentialsId(CREDENTIAL)
             defaultValue('refs/heads/master')
             selectedValue('DEFAULT')
             sortMode('ASCENDING_SMART')
             quickFilterEnabled(true)
             type('PT_BRANCH_TAG')
             tagFilter('*')
             branchFilter('.*')
         }
    }

    logRotator {
        numToKeep(5)
    }

    definition {
        cps {
            script(pipelineTemplate())
            sandbox()
        }
    }

}

 def pipelineTemplate() {
   return '''
pipeline {
  agent {
    node {
      label 'worker'
    }
  }

  options {
    ansiColor('xterm')
    buildDiscarder logRotator(numToKeepStr: '5')
    timestamps()
  }

  stages {

    stage('prepare') {
      steps {
        wrap([$class: 'BuildUser']) {
          script {
            currentBuild.description = "${BUILD_USER_ID} ${params.REVISION}"

            deleteDir()

            def revision = params.REVISION.startsWith('refs/heads') ? params.REVISION : "refs/tags/${params.REVISION}"

            checkout([
                $class                           : 'GitSCM',
                branches                         : [[name: "$revision"]],
                userRemoteConfigs                : [
                    [credentialsId: "<credential id>", url: "<repository url>"],
                ]
            ])

          }
        }
      }
    }
  }
}'''.stripIndent()
 
}

````

## 他のプラグインへの対応

たとえばパラメータの設定時には文字列や選択値の他、Git Parameterなどメジャーなプラグインにも対応しています。
すべてのプラグインに対応することは不可能なので、定義されていないプラグインについては [Dynamic DSL](https://github.com/jenkinsci/job-dsl-plugin/wiki/Dynamic-DSL) によって使用可能になります。
それでも対応不可能な場合は[Configure Block](https://github.com/jenkinsci/job-dsl-plugin/wiki/The-Configure-Block) で直接xmlを記述するようなこともできます。

この辺が拡張性高く作られているのは素晴らしいですね。

### Dynamic DSL

オンラインの[API Viewer](https://jenkinsci.github.io/job-dsl-plugin/)では、デフォルトで定義されているAPIが検索できますが、
インストールしたプラグインのAPIは、自分のJenkinsのAPI Viewer(<https://JENKINS-HOST/plugin/job-dsl/api-viewer/index.html>)で確認できます。

Git Parameter Pluginをインストールしている場合、 `gitParam` 以外に `gitParameter` が見当たると思います。
<https://HOST/plugin/job-dsl/api-viewer/index.html#method/javaposse.jobdsl.dsl.helpers.BuildParametersContext.gitParameter>

Dynamic DSLの場合はAPI Viewer上では右上に紫色のアイコンで Dynamic と表示されています。

````groovy
pipelineJob("foo") {
    parameters {
        gitParameter {
            name("BRANCH")
            description('git branch')
            defaultValue('master')
            selectedValue('DEFAULT')
            sortMode('ASCENDING_SMART')
            quickFilterEnabled(true)
            type('Branch')
            tagFilter('*')
            branchFilter('refs/heads/(.*)')
        }
        
        // ...
    }
    
    // ...
}
````

一点注意としては、API Viewerでパラメータを開くと `Required` がついていたり、設定可能な文字列の一覧が表示されたりします。表示されているとおりに守らないと、設定が反映されません。
`description` いらんやろと思って書かないでいたらいつまでも反映されず、原因特定に時間がかかりました…。

`gitParam` については組み込みDSLにもあるのにDynamic DSLを使う利点としては、プラグインの機能拡張に追従しておらず設定が不便な場合の補完ができる点です。
例えば `gitParam` では `quickFilter` の設定ができませんが `gitParameter` ではできる、などです。
