---
title: Jenkins shared library
date: 2022-08-26T19:13:00+09:00
tags:
- Jenkins
lastmod: 2022-08-26T19:13:00+09:00
---

[note/Jenkins](Jenkins.md) で複数のプロジェクトがあって、それぞれにビルドやデプロイのジョブを作成している。
同じようなステップを実行するので、共通処理をまとめてメンテナスしやすくしたい。

## Jenkins Shared Library

Shared Libraryを使うとpipelineからライブラリに定義された関数や変数を使うことができる。
[Jenkins Shared Librariesの活用事例の紹介 - DeNA Testing Blog](https://swet.dena.com/entry/2021/01/18/200000)

なんと `pipeline {}` ごと定義することもできる。

### 使い方

[Share a standard Pipeline across multiple projects with Shared Libraries](https://www.jenkins.io/blog/2017/10/02/pipeline-templates-with-shared-libraries/)

[Extending with Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)

1. ライブラリを作成する

ライブラリ用のリポジトリを作成して、ディレクトリ構成を以下のようにする(srcかvarsどちらか一つは必須)

`mylibrary`

````
+- src                     # Groovy source files
|   +- org
|       +- foo
|           +- Bar.groovy  # for org.foo.Bar class
+- vars
|   +- foo.groovy          # for global 'foo' variable
|   +- foo.txt             # help for 'foo' variable
+- resources               # resource files (external libraries only)
|   +- org
|       +- foo
|           +- bar.json    # static helper data for org.foo.Bar
````

処理を以下のように記述する。callメソッドを定義すると

`mylibrary/vars/hello.groovy`

````groovy
def call() {
  pipeline {
    agent any
    stages {
      stage('library stage') {
        steps {
          echo "hello"
        }
      }
    }
  }
}
````

2. Jenkinsの管理 > システムの設定 > Global Pipeline Libraries に、ライブラリのリポジトリを設定する

設定値は見ての通り

3. pipelineを作成する

`Jenkinsfile`

````groovy
// ライブラリ名を指定
@Library('mylibrary') _

// xxx.groovy の xxx 部分で関数を実行できる
hello()
````

`vars` 配下に作成した場合は、globalに定義されるためimportを書かずに利用できる。

````groovy
// Global Pipeline Libraries の Default version を使用する
@Library('mylibrary') _

// ブランチやタグを指定する場合
@Library('mylibrary@1.0') _

// 複数ライブラリの読み込み
@Library(['mylibrary', 'other@abcdef1234']) _
````

`src` 配下に作成した場合は、importしてnewでインスタンスを作成した上で利用できる。

````groovy
// 利用したい class を import する
@Library('mylibrary') import org.foo.Sample

// 利用時は script { } ブロック内で利用する
script {
  def sample = new org.foo.Sample()
  sample.hello()   // Sample 内に定義されている hello() メソッドの呼び出し
}
````
