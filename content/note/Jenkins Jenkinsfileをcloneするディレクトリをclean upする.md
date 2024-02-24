---
title: Jenkins Jenkinsfileをcloneするディレクトリをclean upする
date: "2022-12-12T19:02:00+09:00"
tags:
  - Jenkins
---
 

## 経緯

Pipelineジョブを途中でabortしたあと再実行したら、gitのindex.lockがあるためfetchができないというエラーが出る場合がある。

```
 stderr: fatal: Unable to create '/var/jenkins_home/workspace/MyJob@script/.../.git/index.lock': File exists.
 
 Another git process seems to be running in this repository, e.g.
 an editor opened by 'git commit'. Please make sure all processes
 are terminated then try again. If it still fails, a git process
 may have crashed in this repository earlier:
 remove the file manually to continue.
```

こうなってしまうと、Jenkinsfileを含んだリポジトリをcloneする先のディレクトリでgitの操作が行えない。
Jenkinsサーバーにsshして `/var/jenkins_home/workspace/` 配下のジョブのディレクトリを削除するのがすぐ思いつくが、できればsshせずに済ませたい。

## やったこと1

ジョブを書き換えて、Jenkinsfileをcloneせず直接pipelineを書き、clean upする

```groovy
pipeline {
    agent any

    stages {
        stage('clean up') {
            steps {
                deleteDir()
                cleanWs()
            }
        }
    }
}
```

=> これだと `/var/jenkins_home/workspace/MyJob/` は消えてくれるが `MyJob@scipt` は消えなかった


## やったこと2

こちらに答えがあった。
[continuous integration - Jenkins Pipeline Wipe Out Workspace - Stack Overflow](https://stackoverflow.com/questions/37468455/jenkins-pipeline-wipe-out-workspace)

```groovy
pipeline {
    agent any

    stages {
        stage('clean up') {
            steps {
                /* clean up tmp directory */
                dir("${env.WORKSPACE}@tmp") {
                    deleteDir()
                }
                /* clean up script directory */
                dir("${env.WORKSPACE}@script") {
                    deleteDir()
                }
            }
        }
    }
}
```

要するに `/var/jenkins_home/workspace/MyJob@script` に移動して `deleteDir()` を実行しているだけ
