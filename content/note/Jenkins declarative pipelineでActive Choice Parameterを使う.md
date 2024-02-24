---
title: Jenkins declarative pipelineでActive Choice Parameterを使う
date: '2023-05-01T16:22:00+09:00'
tags:
  - '2023/05/01'
  - 'Jenkins'
---

[Active Choices | Jenkins plugin](https://plugins.jenkins.io/uno-choice/) をつかうと、パラメータを動的に設定できるようになる。

Pipeline Syntaxの画面でparametersブロックを作成できるが、そこに出てこないためscriptで書くしかなさそう。

以下のようにpropertiesで作成する。

```groovy
properties([
    parameters([
        [$class: 'ChoiceParameter', 
            choiceType: 'PT_SINGLE_SELECT',
            description: 'Select a choice',
            filterLength: 1,
            filterable: true,
            name: 'Target',
            script: [
                $class: 'GroovyScript',
                fallbackScript: [
                    classpath: [], 
                    sandbox: true, 
                    script: 'return ["ERROR"]'
                ],
                script: [
                    classpath: [], 
                    sandbox: false, 
                    script: """
                        def lines = new File("/var/jenkins_home/workspace/paramlist.txt").readLines()
                        return lines
                    """.stripIndent()
                ]
            ]
        ]
    ])
])

pipeline {
    agent any

    stages {
        stage("Run Tests") {
            steps {
                sh "echo SUCCESS on ${params.Target}"
            }
        }
    }
}
```

他のパラメータの値に応じて選択肢を切り替える場合は `CascadeChoiceParameter` が使える
[Active choice parameter with declarative Jenkins pipeline - Stack Overflow](https://stackoverflow.com/questions/63057793/active-choice-parameter-with-declarative-jenkins-pipeline)

```groovy
properties([
    parameters([
        [$class: 'CascadeChoiceParameter', 
            choiceType: 'PT_SINGLE_SELECT',
            description: 'Select a choice',
            filterLength: 1,
            filterable: true,
            name: 'Target',
            referencedParameters: 'ENVIRONMENT', // 依存するパラメータ名を指定
            script: [
                $class: 'GroovyScript',
                fallbackScript: [
                    classpath: [], 
                    sandbox: true, 
                    script: 'return ["ERROR"]'
                ],
                script: [
                    classpath: [], 
                    sandbox: true, 
                    script: """
                        if (ENVIRONMENT == 'foo') { 
                            return['aaa','bbb']
                        } else {
                            return['ccc', 'ddd']
                        }
                    """.stripIndent()
                ]
            ]
        ]
    ])
])

pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['foo', 'bar'])
    }
    stages {
        stage("Run Tests") {
            steps {
                sh "echo SUCCESS on ${params.ENVIRONMENT} - ${params.Target}"
            }
        }
    }
}
```
