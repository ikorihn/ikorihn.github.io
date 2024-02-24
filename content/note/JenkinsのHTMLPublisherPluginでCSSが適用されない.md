---
title: JenkinsのHTMLPublisherPluginでCSSが適用されない
date: "2021-06-01T18:44:00+09:00"
lastmod: '2021-06-01T18:52:03+09:00'
tags:
  - 'Jenkins'

---

<https://techblog.recochoku.jp/1285>
<https://stackoverflow.com/questions/35783964/jenkins-html-publisher-plugin-no-css-is-displayed-when-report-is-viewed-in-j>

## 原因

<https://www.jenkins.io/doc/book/security/configuring-content-security-policy/>

Content Security Policyが設定されていて、デフォルトではブロックされる

## 解決策

Javaオプションで `hudson.model.DirectoryBrowserSupport.CSP` を設定すればよい

### 1. JenkinsのスクリプトコンソールからCSPを設定する

```shell
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "default-src https: 'unsafe-inline'")
```

ただし、一時的な設定で、再起動するともとに戻る

### 2. 起動オプションに設定する

設定ファイルを書き換える。

rpm パッケージでインストールした場合
`/etc/sysconfig/jenkins`

default

```shell
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true"
```

追加

```shell
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Dhudson.model.DirectoryBrowserSupport.CSP=\"default-src https: 'unsafe-inline'\""
```
