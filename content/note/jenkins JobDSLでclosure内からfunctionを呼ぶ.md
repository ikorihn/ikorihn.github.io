---
title: jenkins JobDSLでclosure内からfunctionを呼ぶ
date: 2022-03-30T16:29:00+09:00
tags:
- Groovy
- Jenkins
lastmod: 2022-03-30T16:29:00+09:00
---

[Jenkins Job DSL Plugin](note/Jenkins%20Job%20DSL%20Plugin.md) でいい感じに書くためのテクニック

素直に書いた場合は以下のようにそれぞれにジョブの定義を書くことになるが、共通化したい部分が出てくることがある。

````groovy
CREDENTIAL_ID = 'secret_key'
REPO_URL = 'https://example.com/repo.git'

pipelineJob("build-A") {
  parameters {
    choiceParam("STAGE", ["stage1", "stage2"], "")
  }

  description('ビルドします')
  logRotator {
    numToKeep(5)
  }
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url(REPO_URL)
            credentials(CREDENTIAL_ID)
          }
        }
      }
      lightweight(true)
      scriptPath(jenkinsfilePath)
    }
  }
}

pipelineJob("build-B") {
  parameters {
    choiceParam("ENV", ["dev1", "dev2"], "")
  }

  // ↓ここから同じ記述なので共通化したい
  description('ビルドします')
  logRotator {
    numToKeep(5)
  }
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url(REPO_URL)
            credentials(CREDENTIAL_ID)
          }
        }
      }
      lightweight(true)
      scriptPath(jenkinsfilePath)
    }
  }
}

````

### 最初にやったこと

単純にメソッドに抜き出した

````groovy
CREDENTIAL_ID = 'secret_key'
REPO_URL = 'https://example.com/repo.git'

def pipelineTemplate(def context, String jenkinsfilePath) {
  description('ビルドします')
  logRotator {
    numToKeep(5)
  }
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url(REPO_URL)
            credentials(CREDENTIAL_ID)
          }
        }
      }
      lightweight(true)
      scriptPath(jenkinsfilePath)
    }
  }
}

pipelineJob("build-A") {
  parameters {
    choiceParam("STAGE", ["stage1", "stage2"], "")
  }

  pipelineTemplate('A/Jenkinsfile')
}

pipelineJob("build-B") {
  parameters {
    choiceParam("ENV", ["dev1", "dev2"], "")
  }
  pipelineTemplate(delegate, 'B/Jenkinsfile')
}


````

これで実行すると、以下のエラーが出てジョブが作られない

`ERROR: (script, line 8) No signature of method: script.description() is applicable for argument types: (java.lang.String) values: [ビルドします]`

descriptionやlogRotatorなどはpipelineJobの中でしか使えないmethodなので、pipelineJobのオブジェクトを渡す必要があった。

https://stackoverflow.com/questions/27931795/how-to-refactor-common-jenkins-jobdsl-code
https://stackoverflow.com/questions/6305910/how-do-i-create-and-access-the-global-variables-in-groovy

### 動くようにしたもの

````groovy
CREDENTIAL_ID = 'secret_key'
REPO_URL = 'https://example.com/repo.git'

def pipelineTemplate(def context, String jenkinsfilePath) {
  // context.method の形式で呼ぶ
  context.description('ビルドします')
  context.logRotator {
    numToKeep(5)
  }
  context.definition {
    cpsScm {
      scm {
        git {
          remote {
            url(REPO_URL)
            credentials(CREDENTIAL_ID)
          }
        }
      }
      lightweight(true)
      scriptPath(jenkinsfilePath)
    }
  }
}

pipelineJob("build-A") {
  parameters {
    choiceParam("STAGE", ["stage1", "stage2"], "")
  }

  pipelineTemplate(delegate, 'A/Jenkinsfile')
}

pipelineJob("build-B") {
  parameters {
    choiceParam("ENV", ["dev1", "dev2"], "")
  }
  pipelineTemplate(delegate, 'B/Jenkinsfile')
}
````

methodの引数にcontext(名前は何でもいい)を追加して、呼び出し元でclosureのdelegateプロパティを渡すことでclosure内のメソッドにアクセスできるようにした。
delegateはGroovyのclosureの中で使えるプロパティでthisのようなもの
http://docs.groovy-lang.org/latest/html/gapi/groovy/lang/Closure.html#getDelegate()
