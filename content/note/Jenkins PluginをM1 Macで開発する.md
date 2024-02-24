---
title: Jenkins PluginをM1 Macで開発する
date: "2022-07-12T12:23:00+09:00"
tags:
  - 'Jenkins'
lastmod: "2022-07-12T12:24:00+09:00"
---

[[note/Jenkins]] のプラグインを開発する

- Java8が必要

`mvn hpi:hpi` でビルドするだけならJDK8がインストールされていればOK

### Jenkins上で確認したい

Docker上でビルドするよろし

```shell
$ mvn hpi:hpl
[INFO] Scanning for projects...
[WARNING] The POM for org.jenkins-ci.tools:maven-hpi-plugin:jar:1.121 is missing, no dependency information available
[WARNING] Failed to build parent project for org.jenkins-ci.plugins:list-git-branches-parameter:hpi:0.0.12-SNAPSHOT
[INFO]
[INFO] ---------< org.jenkins-ci.plugins:list-git-branches-parameter >---------
[INFO] Building List Git Branches Parameter PlugIn 0.0.12-SNAPSHOT
[INFO] --------------------------------[ hpi ]---------------------------------
[INFO]
[INFO] --- maven-hpi-plugin:1.121:hpl (default-cli) @ list-git-branches-parameter ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.614 s
[INFO] Finished at: 2022-07-12T10:53:30+09:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.jenkins-ci.tools:maven-hpi-plugin:1.121:hpl (default-cli) on project list-git-branches-parameter: Property jenkinsHome needs to be set to $JENKINS_HOME. Please use 'mvn -DjenkinsHome=...' orput <settings><profiles><profile><properties><property><jenkinsHome>...</...> -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
```

- Jenkinsdd

### hplの作成

```shell
mvn -DjenkinsHome=$JENKINS_HOME hpi:hpl

```
