---
title: jenkinsサーバーにbrewを入れたがpathが認識されない
date: 2020-12-09T10:56:00+09:00
tags:
- Jenkins
lastmod: 2021-05-30T18:43:06+09:00
---

## トラブルシュート

### PATHが認識されない

Jenkinsの管理 -> システムの設定 -> グローバルプロパティにPATHを設定してもうまく設定されない

````
キー: PATH
値: /usr/local/bin:$PATH
````

ではなく

````
キー: PATH+EXTRA
値: /usr/local/bin
````

とする。EXTRAの部分はなんでもいいみたい

<https://ikesyo.hatenablog.com/entry/2018/03/27/191317>
<https://issues.jenkins.io/browse/JENKINS-41339>

### linuxbrewで入れたコマンドが実行できない

下記の通り入れたがpathが通っていない

````
キー: PATH+EXTRA
値: /home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin
````

jenkinsジョブで実行

````bash
echo $PATH
# => `/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:/sbin:/bin:/usr/sbin:/usr/bin`
````

````bash
ls -al /home
total 0
drwxr-xr-x  3 root     root      22 Dec 16  2019 .
dr-xr-xr-x 18 root     root     257 Dec 16  2019 ..
drwx------  5 ec2-user ec2-user 196 Dec  9 13:12 ec2-user
````

ssh でjenkinsユーザーでログインすると見えるがジョブからは見えない
