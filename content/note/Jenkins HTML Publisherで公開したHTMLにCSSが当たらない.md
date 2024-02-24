---
title: Jenkins HTML Publisherで公開したHTMLにCSSが当たらない
date: "2022-01-20T16:41:00+09:00"
tags:
  - Jenkins
---
 

## 事象

[Jenkins - HTML Publisher Plugin - No CSS is displayed when report is viewed in Jenkins Server](https://stackoverflow.com/questions/35783964/jenkins-html-publisher-plugin-no-css-is-displayed-when-report-is-viewed-in-j)

[[note/Jenkins]] HTML Publisher Pluginで公開したhtmlで、CSSが読み込まれずスタイルが当たらない。
ブラウザのコンソールに以下のエラーメッセージが出ていた。

```
because it violates the following Content Security Policy directive: "default-src https: 'unsafe-inline'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback.
```

## 手順

### HTMLを公開する

[Jenkins の HTML Publisher Plugin を使って、Gauge が出したテスト結果の HTML レポートをいい感じに見れるようにする - ゆふてっく。](https://yufutech.hatenablog.com/entry/2021/03/07/201536)

こちらのようにしてhtml,cssを作成した

```groovy
pipeline {
  stages {
      stage('make html') {
          steps {
              sh '''
              mkdir -p report
              echo "<html><head> <link rel="stylesheet" href="index.css"> </head> <body><div>Hello, world</div></body></html>" > report/index.html
              echo "div { font-size: "20px"; }" > report/index.css
              '''
          }
      }
  }
  post {
      always {
          // 成果物を保存
          archiveArtifacts artifacts: 'report/*'
          // publish html
          publishHTML target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: false,
            reportDir: 'report',
            reportFiles: '*',
            reportName: 'html-report'
          ]
      }
  }
}
```

`${ジョブのURL}/${reportNameで指定した名前}` でhtmlを開くことができるが、これだけだとスタイルがあたっていないため、Jenkins のセキュリティ設定を変更する。

### 一時的

Jenkinsの管理 > スクリプトコンソール にて以下を入力して実行する

```java
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
```

→ Jenkins再起動するとリセットされる

### 恒久的

Jenkinsの起動時オプションに指定することで常に適用させることができる。

`sudo vi /etc/sysconfig/jenkins` を開いて、 `JENKINS_JAVA_OPTIONS` を変更する。
空にするのは危なそうなので、必要な分だけ許可するようにする。

```shell
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Dhudson.model.DirectoryBrowserSupport.CSP=\"default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' 'unsafe-inline' data:;\""
```
