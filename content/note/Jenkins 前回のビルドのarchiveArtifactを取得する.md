---
title: Jenkins 前回のビルドのarchiveArtifactを取得する
date: "2023-04-20T14:26:00+09:00"
tags:
  - '2023/04/20'
  - 'Jenkins'
lastmod: "2023-04-20T14:26:00+09:00"
---

前回のビルドの成果物を取得したいことがたまにあるので調べた。

result.txtをarchiveしているとして考える

## ArtifactManagerを使う場合

https://javadoc.jenkins.io/hudson/model/Run.html?is-external=true#getArtifactManager()

`Run.getArtifactManager().root().child("relativepath/to/file")`  で [VirtualFile](https://javadoc.jenkins-ci.org/jenkins/util/VirtualFile.html) が取得できる

```
    script {
        def build = currentBuild.previousBuild.rawBuild
        def am = build.artifactManager
        def virtualFile = am.root().child('result.txt')
        println virtualFile
    }
```

## shell内でファイルを使いたい場合

https://javadoc.jenkins.io/hudson/model/Run.html?is-external=true#getRootDir()

`Run.getRootDir()` でビルドディレクトリを `java.io.File` として取得できる
あとはgetAbsolutePathで絶対パスを取得するなどする

```
    script {
        def prevBuild = currentBuild.previousBuild
        def prevBuildPath = prevBuild.rawBuild.rootDir.absolutePath
        
        withEnv(["PREV_BUILD=${prevBuildPath}"]) {
            sh '''
            echo '----prev ${prevBuildPath}----'
            cat ${PREV_BUILD}/archive/result.txt
            '''
        }

    }
```
