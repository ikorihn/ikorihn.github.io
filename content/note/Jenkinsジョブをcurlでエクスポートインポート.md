---
title: Jenkinsジョブをcurlでエクスポートインポート
date: 2021-05-30T18:46:00+09:00
lastmod: 2021-05-30T18:47:14+09:00
tags:
- Jenkins
---

[note/Jenkins](Jenkins.md) ジョブ設定をcurlでインポートしたい

1. `crumbIssuer/api/xml` にBASIC認証でGETリクエストをなげ、`/defaultCrumbIssuer/crumbRequestField` と `/defaultCrumbIssuer//crumb/` をコロンで結合したものがcrumb
1. cookieにcrumbを保存する
1. cookieとBASIC認証を使って、 `http://jenkins-url.com/path/to/job/directory/createItem?name=${job_name}` にpostする
   1. リクエストボディにエクスポートしたジョブのxmlを指定する

````shell
$ curl -O -u $user:$passwd '[http://old-jenkins/job/job_name/config.xml](http://old-jenkins/job/job_name/config.xml)'  
$ set CRUMB (curl -s --cookie-jar /tmp/cookies -u $user:$passwd '[http://new-jenkins/jenkins/crumbIssuer/api/xml](http://new-jenkins/jenkins/crumbIssuer/api/xml)' | xmllint --xpath 'concat(/defaultCrumbIssuer/crumbRequestField/text(),":",/defaultCrumbIssuer//crumb/text())' -)  
$ curl -s --cookie /tmp/cookies -u $user:$passwd '[http://new-jenkins/jenkins/job/directory/createItem?name=job_name](http://new-jenkins/jenkins/job/directory/createItem?name=job_name)' --data-binary @config.xml -H 'Content-Type:text/xml' -H "$CRUMB"
````

xmllintを使ったが、Jenkinsリクエストにクエリパラメータでもよいみたい
`/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)'`
