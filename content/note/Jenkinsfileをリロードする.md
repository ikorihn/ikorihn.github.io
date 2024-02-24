---
title: Jenkinsfileをリロードする
date: "2022-01-27T17:01:00+09:00"
tags:
  - 'Jenkins'
---

[[Jenkinsfile]] 内でパラメータを `parameters` ブロックで定義しても、一度実行しないと反映されない。

https://stackoverflow.com/questions/44422691/how-to-force-jenkins-to-reload-a-jenkinsfile
refresh用のパラメータを定義しておくのが常套手段

```groovy
pipeline {
    agent any
    parameters {
        booleanParam(name: 'Refresh',
                    defaultValue: false,
                    description: 'Read Jenkinsfile and exit.')
    }
    stages {
        stage('Read Jenkinsfile') {
            when {
                expression { return params.Refresh == true }
            }
            steps {
              echo("stop")
            }
        }
        stage('Run Jenkinsfile') {
            when {
                expression { return params.Refresh == false }
            }
            stages {
              stage('Build') {
                  steps {
                    echo("build")
                  }
              }
              stage('Test') {
                  steps {
                    echo("test")
                  }
              }
              stage('Deploy') {
                  steps {
                    echo("deploy")
                  }
              }
            }
        }
    }
}
```


### Job DSLを使用している場合

```groovy
pipelineJob('myJobName') {
    // sets RELOAD=true for when the job is 'queued' below
    parameters {
        booleanParam('RELOAD', true)
    }

    definition {
        cps {
            script(readFileFromWorkspace('Jenkinsfile'))
            sandbox()
        }
    }

    // queue the job to run so it re-downloads its Jenkinsfile
    queue('myJobName')
}
```

errorを使ってジョブを止めてしまえば、 `RELOAD==false` で囲う必要がなくなる
 
```groovy
pipeline {
    agent any
    stages {
        stage('Preparations') {
            when { expression { return params.RELOAD == true } }
            // Because this: https://issues.jenkins-ci.org/browse/JENKINS-41929
            steps {
                script {
                    if (currentBuild.getBuildCauses('hudson.model.Cause') != null) {
                        currentBuild.displayName = 'Parameter Initialization'
                        currentBuild.description = 'On first build we just load the parameters as they are not available of first run on new branches.  A second run has been triggered automatically.'
                        currentBuild.result = 'ABORTED'

                        error('Stopping initial build as we only want to get the parameters')
                    }
                }
            }
        }

        stage('Parameters') {
            steps {
                echo 'Running real job steps...'                
            }
        }
}
```
