---
title: jenkinsのEC2Slaveの初期化
date: "2021-06-14T19:06:00+09:00"
lastmod: '2021-06-14T19:14:27+09:00'
tags:
  - 'Jenkins'
---

Jenkins EC2 は init scriptの他にUser dataでも初期化処理をかける

こうかくと、yum updateされる

```txt
#cloud-config
timezone: "Asia/Tokyo"
repo_update: true
repo_upgrade: all
```

これはそもそもAmazon EC2の機能でcloud initによる初期処理を行っている

<https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/user-data.html>
<https://aws.amazon.com/jp/premiumsupport/knowledge-center/execute-user-data-ec2/>
