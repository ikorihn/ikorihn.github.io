---
title: Jenkins JobDSLをCIでvalidateしたい
date: "2022-07-07T19:17:00+09:00"
tags:
  - 'Jenkins'
lastmod: "2022-07-07T19:17:00+09:00"
---

[[Jenkins Job DSL Plugin]]

[job-dsl-plugin/Testing-DSL-Scripts.md at master · jenkinsci/job-dsl-plugin · GitHub](https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/Testing-DSL-Scripts.md)
公式でtestの方法書いてくれたのでまずはこれを試してみる

### gradle初期化

```
gradle init
```

サンプルはバージョン古くて動かなかったので上げてみたけど、testディレクトリが認識されない？のか実行されないで終了する

build.gradle

```groovy
plugins {
  id 'groovy'
}

sourceSets {
    jobs {
        groovy {
            srcDirs 'manifest/jenkins/overlays'
        }
    }
    test {
        groovy {
            srcDir 'src/test/groovy'
        }
    }
}

ext {
    jobDslVersion = '1.78.1'
    jenkinsVersion = '2.319.3'
}

repositories {
    mavenCentral()
    maven {
        url 'https://repo.jenkins-ci.org/public/'
    }
}

configurations {
    testPlugins {}

    // see JENKINS-45512
    testCompile {
        exclude group: 'xalan'
        exclude group: 'xerces'
    }
}

dependencies {
    implementation 'org.codehaus.groovy:groovy-all:3.0.11'

    testImplementation platform("org.spockframework:spock-bom:2.1-groovy-3.0")
    testImplementation "org.spockframework:spock-core"
    testImplementation "org.spockframework:spock-junit4"  // you can remove this if your code does not rely on old JUnit 4 rules

    // Jenkins test harness dependencies
    testImplementation 'org.jenkins-ci.main:jenkins-test-harness:1794.vfb_4a_4cde0824'
    testImplementation "org.jenkins-ci.main:jenkins-war:${jenkinsVersion}"

    // Job DSL plugin including plugin dependencies
    testImplementation "org.jenkins-ci.plugins:job-dsl:${jobDslVersion}"
    testImplementation "org.jenkins-ci.plugins:job-dsl:${jobDslVersion}@jar"
    testImplementation 'org.jenkins-ci.plugins:structs:1.19@jar'
    testImplementation 'org.jenkins-ci.plugins:script-security:1.54@jar'

    // plugins to install in test instance
    testPlugins 'org.jenkins-ci.plugins:ghprb:1.31.4'
    testPlugins 'com.coravy.hudson.plugins.github:github:1.28.0'
}

task resolveTestPlugins(type: Copy) {
    from configurations.testPlugins
    into new File(sourceSets.test.output.resourcesDir, 'test-dependencies')
    include '*.hpi'
    include '*.jpi'

    doLast {
        def baseNames = source.collect { it.name[0..it.name.lastIndexOf('.')-1] }
        new File(destinationDir, 'index').setText(baseNames.join('\n'), 'UTF-8')
    }
}

test {
    dependsOn tasks.resolveTestPlugins
    inputs.files sourceSets.jobs.groovy.srcDirs

    // set build directory for Jenkins test harness, JENKINS-26331
    systemProperty 'buildDirectory', project.buildDir.absolutePath
}

```

### Spock

[13. ユニットテスト - Apache Groovyチュートリアル](https://koji-k.github.io/groovy-tutorial/unit-test/index.html)
Groovyのテスティングフレームワークのスタンダードらしい。聞いたことなかった

<https://github.com/sheehan/job-dsl-gradle-example>
-> 自分でこの構成を真似てファイルを作ったら動く カスタマイズしやすいのでこれが良さそう

<https://github.com/AOEpeople/gradle-jenkins-job-dsl-plugin>
-> gradle 6系にしたらとりあえず動く

<https://github.com/johnmartel/jenkins-job-dsl-script-validator-plugin>
-> バージョン古すぎて動かなかった

## エラー対処

./gradlew test でテスト実行できるようになった

### `version 2.4 or later of plugin 'workflow-job' needs to be installed`

<https://github.com/AOEpeople/gradle-jenkins-job-dsl-plugin/issues/16>
より新しいプラグインを入れてもエラーになり、ぴったりのバージョンでないとだめ 正規表現がおかしいっぽい

<https://mvnrepository.com/artifact/org.jenkins-ci.plugins.workflow/workflow-job?repo=jenkins-incrementals>

#### `Caused by: javaposse.jobdsl.dsl.DslScriptException: (script, line 6) No signature of method: javaposse.jobdsl.dsl.helpers.BuildParametersContext.booleanParam() is applicable for argument types: (java.util.LinkedHashMap) values: [[parameterName:FOO, defaultValue:false]]`

名前付き引数で書いてるところがエラーになってる
実際にはジョブ反映されている
<http://job-dsl.herokuapp.com> で実行するとたしかにエラーになるから書き方変えるべきなのか

### `Could not create item, unknown parent path in "path/to/job"`

foldersで親ディレクトリ作られるはずだけど、読み込み順の問題かもしれない

### `Caused by: java.lang.NoClassDefFoundError: com/cloudbees/hudson/plugins/folder/Folder`

Folders pluginはインストールしているのになぜ
なぜかひとつのサブフォルダだけでテストするとうまくいく、複数のファイル一気にテストしようとすると発生する

### `No signature of method: javaposse.jobdsl.dsl.helpers.BuildParametersContext.gitParameter`

git-parameterプラグインは追加しているのに解消されない
