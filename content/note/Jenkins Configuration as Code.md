---
title: Jenkins Configuration as Code
date: 2022-07-07T19:51:00+09:00
tags:
- Jenkins
lastmod: 2022-07-07T19:51:00+09:00
---

JCasC

Jenkinsの設定をコード化するプラグイン

https://github.com/jenkinsci/configuration-as-code-plugin

## Kubernetesで使用する

helmを使う
https://github.com/jenkinsci/helm-charts

`CASC_JENKINS_CONFIG=/var/jenkins_home/casc_config` が設定されているので、ここに設定が置かれるように作る

## Job DSLとの連携

<https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/JCasC.md>

https://github.com/jenkinsci/configuration-as-code-plugin/blob/master/docs/seed-jobs.md

* ConfigMapでjobs.yamlを作って `$CASC_JENKINS_CONFIG ` に置く
