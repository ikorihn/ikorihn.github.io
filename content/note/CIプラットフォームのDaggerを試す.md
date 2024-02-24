---
title: CIプラットフォームのDaggerを試す
date: "2022-10-17T14:16:00+09:00"
tags:
  - 'CICD'
---

#CICD

[Overview | Dagger](https://docs.dagger.io/)
[CI・CD界隈期待の星!!Daggerに入門してローカルとGithubActionsでCIを動かしてみた | DevelopersIO](https://dev.classmethod.jp/articles/dagger_cicd_get_started/)

ポータブルなCI/CDパイプライン devkit
Dockerコンテナ上で実行されて、どこでも動かすことができる

- CI/CDサービス固有の記法を学習する必要があり、移行の際には書き換えが必要
- ローカルで試しにくく、commit & pushしては動くか確認する作業が発生
- YAMLが辛い

Dagger はプラットフォーム非依存でCUE言語を使って書けるのが良さそう。
ローカルで実行できるっていうのも大きい

- CUE言語がそんなにまだメジャーでない
  - IaCでたまに見るかな？Go には公式のparserがある
- まだメジャーバージョン0系で開発途上

## インストール

macはHomebrewでもインストールできる

install.sh を使ってインストールすることもできる

```shell
curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.2.19 sh

./bin/dagger version
dagger 0.2.19 (GIT_SHA) darwin/arm64
```

## サンプル

```shell
git clone https://github.com/dagger/todoapp
cd todoapp
dagger project update
dagger do build
```

## 使ってみる

hello.cue

```go
package main

import (
    "dagger.io/dagger"
    "dagger.io/dagger/core"
)

// Write a greeting to a file, and add it to a directory
#AddHello: {
    // The input directory
    dir: dagger.#FS

    // The name of the person to greet
    name: string | *"world"

    write: core.#WriteFile & {
        input: dir
        path: "hello-\(name).txt"
        contents: "hello, \(name)!"
    }

    // The directory with greeting message added
    result: write.output
}

dagger.#Plan & {
    // Say hello by writing to a file
    actions: hello: #AddHello & {
        dir: client.filesystem.".".read.contents
        name: "hey"
    }
    client: filesystem: ".": {
        read: contents: dagger.#FS
        write: contents: actions.hello.result
    }
}
```

```shell
dagger project init
dagger project update

dagger do hello
```

`dagger project update` を実行すると、 `./cue.mod` が更新される
go get したときに `$GOPATH/pkg/mod` にソースがダウンロードされるが、それと同じように `./cue.mod` に置かれる

## Actions

Actions が基本的な要素となる
4つのライフサイクルがある

- Definition
- Integration
- Discovery
- Execution

pipelines と steps のような区別がなく、全てをActionで定義できる
定義済みのActionを他のActionからサブアクションとして呼び出せる

公式の説明で使われているDefinition

```go
// Write a greeting to a file, and add it to a directory
#AddHello: {
    // The input directory
    dir: dagger.#FS

    // The name of the person to greet
    name: string | *"world"

    write: core.#WriteFile & {
        input: dir
        path: "hello-\(name).txt"
        contents: "hello, \(name)!"
    }

    // The directory with greeting message added
    result: write.output
}
```

ここでは `core.#WriteFile` という core で定義済みの Action を `#AddHello` の中で呼び出している

## Integration

全てのパイプラインは `dagger.#Plan` definition で定義される

`dagger do --help` を実行すると、定義済みの Action 一覧が出力される

```shell
$ ./dagger do --help
Usage:
  dagger do <action> [subaction...] [flags]

Options


Available Actions:
 hello Say hello by writing to a file
```

## AWS SAMのデプロイのサンプル

<https://docs.dagger.io/1248/aws-sam>
sam用のActionがimportして使用できる

zipをデプロイするパターン

```go
package samZip

import (
    "dagger.io/dagger"
    "universe.dagger.io/alpha/aws/sam"
)

dagger.#Plan & {
    _common: config: sam.#Config & {
        accessKey: client.env.AWS_ACCESS_KEY_ID
        region:    client.env.AWS_REGION
        bucket:    client.env.AWS_S3_BUCKET
        secretKey: client.env.AWS_SECRET_ACCESS_KEY
        stackName: client.env.AWS_STACK_NAME
    }

    client: {
        filesystem: "./": read: contents: dagger.#FS
        env: {
            AWS_ACCESS_KEY_ID:     string
            AWS_REGION:            string
            AWS_S3_BUCKET:         string
            AWS_SECRET_ACCESS_KEY: dagger.#Secret
            AWS_STACK_NAME:        string
        }
    }

    actions: {
        build: sam.#Package & _common & {
            fileTree: client.filesystem."./".read.contents
        }
        deploy: sam.#DeployZip & _common & {
            input: build.output
        }
    }
}
```

Dockerイメージをデプロイするパターン

```go
package samImage

import (
    "dagger.io/dagger"
    "universe.dagger.io/alpha/aws/sam"
)

dagger.#Plan & {
    _common: config: sam.#Config & {
        accessKey:    client.env.AWS_ACCESS_KEY_ID
        region:       client.env.AWS_REGION
        secretKey:    client.env.AWS_SECRET_ACCESS_KEY
        stackName:    client.env.AWS_STACK_NAME
        clientSocket: client.network."unix:///var/run/docker.sock".connect
    }

    client: {
        filesystem: "./": read: contents: dagger.#FS
        network: "unix:///var/run/docker.sock": connect: dagger.#Socket
        env: {
            AWS_ACCESS_KEY_ID:     string
            AWS_REGION:            string
            AWS_SECRET_ACCESS_KEY: dagger.#Secret
            AWS_STACK_NAME:        string
        }
    }

    actions: {
        build: sam.#Build & _common & {
            fileTree: client.filesystem."./".read.contents
        }
        deploy: sam.#Deployment & _common & {
            input: build.output
        }
    }
}
```

## Jenkins上で利用する

Jenkinsにdocker、daggerをインストールしておく

```groovy
pipeline {
  agent any
  environment {
    NAME='John'
  }
  stages {
    stage("setup") {
      steps {
        sh '''
          # インストールずみなら不要
          curl -L https://dl.dagger.io/dagger/install.sh | sh
        
          ./bin/dagger project init
          ./bin/dagger project update
        '''
      }
    }
    stage("do") {
      steps {
        sh '''
        cat << EOF > dagger.cue
        package main
        
        import (
            "dagger.io/dagger"
            "dagger.io/dagger/core"
        )
        
        // Write a greeting to a file, and add it to a directory
        #AddHello: {
            // The input directory
            dir: dagger.#FS
            
            name: string | *"world"

            write: core.#WriteFile & {
                input: dir
                path: "hello-\\(name).txt"
                contents: "hello, \\(name)!"
            }
        
            // The directory with greeting message added
            result: write.output
        }
        
        dagger.#Plan & {
            // Say hello by writing to a file
            actions: hello: #AddHello & {
                dir: client.filesystem.".".read.contents
                name: client.env.NAME
            }
            client: {
                filesystem: ".": {
                    read: contents: dagger.#FS
                    write: contents: actions.hello.result
                }
                env : {
                    NAME: string
                }
            }
        }

        EOF
        
        ./bin/dagger do hello
        '''.stripIndent()
      }
    }    
  }
}

```
