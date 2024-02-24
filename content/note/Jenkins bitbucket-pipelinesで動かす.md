---
title: Jenkins bitbucket-pipelinesで動かす
date: "2022-10-23T22:18:00+09:00"
tags:
  - Jenkins
---

Jenkinsをhelm chartを使ってk8sで動かしていて、JCasCのコードをGitで管理していて、設定が正しいのかどうかは反映されるまでわからない
これをCIでチェックできるようにしたかった

[Jenkins ジョブを GitHub Actions 上で動かせるようになりました](https://zenn.dev/snowcait/articles/c17b08e8f3485f)
を参考にした

## Dockerで動かせるようにする


```yaml
services:
  jenkins:
    build:
      context: .
      args:
        tag: ${JENKINS_IMAGE_TAG}
    ports:
      - 8080:8080
      - 50000:50000
    environment:
      - JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
      - CASC_RELOAD_TOKEN="reload-token"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

```Dockerfile
ARG tag="lts-jdk11"
FROM jenkins/jenkins:${tag}
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY --chown=jenkins:jenkins jcasc/jenkins.yaml /var/jenkins_home/
COPY --chown=jenkins:jenkins jcasc/jobdsl/ /var/jenkins_home/jobdsl/
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt
```

プラグイン一覧をplugins.txtに書く

`plugins.txt`

```
cloudbees-folder
timestamper
ws-cleanup
workflow-aggregator
git
configuration-as-code
configuration-as-code-groovy
job-dsl
```

JCasCの設定をjenkins.yamlに書く

```yaml
jobs:
  - file: /var/jenkins_home/jobdsl/job1.groovy
```

`jobdsl/job1.groovy`

```groovy
pipelineJob('job-dsl-groovy') {
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url('https://github.com/jenkinsci/job-dsl-plugin.git')
          }
          branch('*/master')
        }
      }
      lightweight()
    }
  }
}
```

### やっていること

- DockerfileでJenkinsを設定
- plugins.txt、jenkins.yaml、job-dslのgroovyファイルをコピー
- jenkins-cliでpluginをインストール
- これをdocker composeで起動 

```shell
docker compose -f compose.yaml up -d --wait
curl -O http://localhost:8080/jnlpJars/jenkins-cli.jar
java -jar jenkins-cli.jar -s http://localhost:8080/ -webSocket reload-jcasc-configuration
```


### reload-configuration

## 最終的にどうしたか

一個のリポジトリで複数Jenkinsのコードをディレクトリ別で管理するような構成になっていたので、なかなかうまくできなかった
結局それぞれのJenkins上で reload-jcasc-configuration 

```shell
curl -O http://localhost:8080/jnlpJars/jenkins-cli.jar
java -jar jenkins-cli.jar -s http://localhost:8080/ -webSocket reload-jcasc-configuration
```
