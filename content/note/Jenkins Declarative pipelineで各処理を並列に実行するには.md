---
title: Jenkins Declarative pipelineで各処理を並列に実行するには
date: 2024-05-01T16:27:00+09:00
tags:
  - Jenkins
---

[[Jenkins]] で逐次実行している処理に時間がかかっているとき、並列化するだけで手軽に高速化できる場合があります。


```groovy
pipeline {
  agent any
  stages {
    stage("parallel") {
      parallel {
        stage('job1') {
          when {[]()
            expression {
              return job1.toBoolean()
            }
          }
          steps {
            build job: 'test-job1', parameters: [
                [$class: 'StringParameterValue', name: "date", value: "$date"]
            ]
          }
        }
        stage('job2') {
          when {
            expression {
              return job2.toBoolean()
            }
          }
          steps {
            build job: 'test-job2', parameters: [
                [$class: 'StringParameterValue', name: "date", value: "$date"]
            ]
          }
        }
        stage('job3') {
          when {
            expression {
              return job3.toBoolean()
            }
          }
          steps {
            build job: 'test-job3', parameters: [
                [$class: 'StringParameterValue', name: "date", value: "$date"]
            ]
          }
        }
      }
    }
  }
}
```

```groovy
pipeline {
    parameters {
        string(name: "NAMES", description: "comma separated list")
    }

    stages {
        stage("run") {
            steps {
                script {
                    def nameList = params.NAMES.split(",")

                    // { ブランチ名: {処理}} というmapを作る
                    def branches = nameList.collectEntries{ it ->
                        [it,
                            {
                                stage("run-${it}") {
                                    // stepを実行する
                                    withEnv([
                                      "NAME=${it}",
                                    ]) {
                                        sh '''
                                        echo "Hello ${NAME}"
                                        '''
                                    }

                                    // 子ジョブを実行する
                                    build(job: "child", parameters: [string(name: 'NAME', value: it)])
                                }
                            }
                        ]
                    }

                    println branches
                    // => [
                    //  "foo": { stage("run-foo") { ... } },
                    //  "bar": { stage("run-bar") { ... } },
                    // ]

                    parallel branches

                    // 同時実行数を制限したい場合は以下のようにする
                    // def MAX_CONCURRENT = 4
                    // (branches.keySet() as List).collate(MAX_CONCURRENT).each{
                    //     parallel branches.subMap(it)
                    // }
                }
            }
        }
    }
}
```