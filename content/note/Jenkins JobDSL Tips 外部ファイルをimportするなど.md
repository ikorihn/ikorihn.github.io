---
title: Jenkins JobDSL Tips 外部ファイルをimportするなど
date: "2022-07-07T19:20:00+09:00"
tags:
  - 'Jenkins'
lastmod: "2022-07-07T19:39:00+09:00"
---


[[Jenkins Job DSL Plugin]] のTIPS

## job DSLのサンプル集

https://github.com/edx/jenkins-job-dsl
https://github.com/sheehan/job-dsl-gradle-example
https://github.com/unguiculus/job-dsl-sample


## 上級者向けオプション

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/User-Power-Moves.md


## JCasCとの連携

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/JCasC.md

You can pass values from the YAML file to the Job DSL script.

### 共通で使える変数を定義する

```yaml
jobs:
  - providedEnv:
      SUPERHERO: 'Midnighter'
  - file: ./jobdsl/job.groovy
```

```groovy
//job.groovy
job('awesome-job') {
    description("favorite job of ${SUPERHERO}")
}
```


## 別ファイルをimportする

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/Real-World-Examples.md#import-other-files-ie-with-class-definitions-into-your-script

ファイルをどこに置いたらいいのかこれを見てもよくわからない。
Gradleで作るのが前提なの？
classpath上に置いといたらいいんだろうか

## Job DSLのFactoryを作る

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/Job-DSL-Commands.md#dsl-factory

> Because the engine is just Groovy, you can call other Groovy classes on the classpath

classpathどこ…


[こういうクラス](https://github.com/sheehan/job-dsl-gradle-example/blob/master/src/main/groovy/com/dslexample/builder/GradleCiJobBuilder.groovy)を作って、[dslのほうで読み込ませる](https://github.com/sheehan/job-dsl-gradle-example/blob/master/src/jobs/example7Jobs.groovy)

JCasCではできないかもしれない😞
https://github.com/jenkinsci/configuration-as-code-plugin/issues/1355


## groovyをloadする

[Jenkins / Groovy language patterns](https://gist.github.com/thikade/5e68a99d611510a521ad74d5f9c88a13)


## IDEで補完を効かせたい

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/IDE-Support.md


## script consoleからJob DSLのAPIを叩いてジョブを作る

これを貼って実行するだけ

```groovy
import javaposse.jobdsl.dsl.*
import  javaposse.jobdsl.plugin.*

JenkinsJobManagement jm = new JenkinsJobManagement(System.out, [:], new File('.'));
DslScriptLoader dslScriptLoader = new DslScriptLoader(jm)
dslScriptLoader.runScript("folder('project-a')")
```
