---
title: Jenkins pipelineで他のジョブを停止する
date: "2022-07-05T18:16:00+09:00"
tags:
  - 'Jenkins'
lastmod: "2022-07-05T18:16:00+09:00"
---

[[Jenkins Pipeline]] 

```groovy
pipeline {
  stages {
    stage('abort jobs') {
      steps {
        script {
          Jenkins.instance.getAllItems(Job.class).collectMany { job ->
            // ビルド一覧にflattenする
            job.builds
          }.findAll { build ->
            // ビルド中のジョブに絞る
            build.building
          }.each { build ->
            // ジョブを停止する
            build.doStop()
          }

        }
      }
    }
  }
}
```

- groovyの記法で、`.getXXX()` は `.XXX` でプロパティアクセスできる

## reference

- [Groovy スクリプトで Jenkins 上のすべての Job を制御する | まくまくいろいろノート](https://maku77.github.io/memo/jenkins/handle-jobs.html)
- [Mirantis Documentation: Abort a hung build in Jenkins](https://docs.mirantis.com/mcp/q4-18/mcp-operations-guide/drive-train-operations/jenkins-abort-hung-build.html)
- [jenkinsでジョブがチェックアウトするブランチを一括設定する · GitHub](https://gist.github.com/tckz/2835544)
- https://javadoc.jenkins-ci.org/jenkins/model/Jenkins.html
- https://javadoc.jenkins.io/hudson/model/Job.html#getBuilds()
- https://javadoc.jenkins.io/hudson/model/Run.html#isBuilding()
- https://javadoc.jenkins.io/hudson/model/AbstractBuild.html#doStop()

