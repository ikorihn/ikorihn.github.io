---
title: Jenkins PipelineでParameterのFileが動作しないバグ
date: "2021-09-21T19:20:00+09:00"
tags:
  - 'Jenkins'
lastmod: '2021-09-21T19:20:31+09:00'
---

[[note/Jenkins]] pluginのバグ

<https://issues.jenkins.io/browse/JENKINS-27413>
<https://stackoverflow.com/questions/38080876/jenkins-pipeline-job-with-file-parameter>

pipelineじゃなくふつうのジョブでパラメータにFileを指定する分には問題ない

![[note/Pasted-image-20210921192112.png|Pasted-image-20210921192112]]
![[note/Pasted-image-20210921192126.png|Pasted-image-20210921192126]]

pipelineで指定するとファイルがアップロードされない

```groovy
pipeline {
  agent any
  parameters {
    file (
        name: 'file.txt',
    )
  }
}
```

## 対応

https://plugins.jenkins.io/file-parameters/ プラグインを使う

大きいファイルには `stashedFile`、小さいファイルには `base64File` パラメータを使用する

```groovy
pipeline {
  agent any
  parameters {
    base64File 'small'
    stashedFile 'large'
  }
  stages {
    stage('Example') {
      steps {
        withFileParameter('small') {
          sh 'cat $small'
        }
        unstash 'large'
        sh 'cat large'
      }
    }
  }
}
```
