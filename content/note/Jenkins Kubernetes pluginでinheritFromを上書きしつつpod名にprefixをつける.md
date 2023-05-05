---
title: Jenkins Kubernetes pluginでinheritFromを上書きしつつpod名にprefixをつける
date: 2023-02-02T19:21:00+09:00
tags:
- 2023/02/02
- Jenkins
---

configure cloudsの設定でpodTemplateを定義ずみで、 `inheritFrom` で継承しつつ一部だけを上書きしたいときの書き方

podTemplateの設定

* name `my-jenkins-agent`
* labels `my-jenkins-agent`

````groovy
pipeline {
  agent {
    kubernetes {
      inheritFrom 'my-jenkins-agent'
      label 'my-jenkins-agent'
      yamlMergeStrategy merge()
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: some-label-value
        spec:
          containers:
          - name: maven
            image: maven:alpine
            command:
            - cat
            tty: true

        '''
    }
  }
  stages {
    stage('Run maven') {
      steps {
        container('maven') {
          sh 'mvn -version'
        }
      }
    }
  }
}

````

こうすると、設定済みのpodTemplateが使われて `yaml` に書いた定義は反映されない。
labelが完全一致していると上書きできないのかも？

````groovy
    kubernetes {
      inheritFrom 'my-jenkins-agent'
      // label 'my-jenkins-agent'
      yamlMergeStrategy merge()
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: some-label-value
        spec:
          containers:
          - name: maven
            image: maven:alpine
            command:
            - cat
            tty: true

        '''
    }
````

`label` を削除すると `yaml` の定義が反映されるが、pod名が `my-jenkins-agent-<random string>` とはならず、ジョブ名がprefixについたpodが作成される

````groovy
    kubernetes {
      inheritFrom 'my-jenkins-agent'
      label 'my-jenkins-agent-custom'
      yamlMergeStrategy merge()
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            some-label: some-label-value
        spec:
          containers:
          - name: maven
            image: maven:alpine
            command:
            - cat
            tty: true

        '''
    }
````

このように `label` に podTemplate とは異なる値をつけることで、 `my-jenkins-agent-custom-<random string>` というpodで作成された。
custom というのが入ってしまうのは気になるが仕方ない

podTemplateのlabelsの設定を消すことで、  `label 'my-jenkins-agent'` としてもpod名が意図通りになりつつ上書きできたので、これでもいい。
