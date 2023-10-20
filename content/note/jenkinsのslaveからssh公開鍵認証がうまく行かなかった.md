---
title: jenkinsのslaveからssh公開鍵認証がうまく行かなかった
date: 2021-01-12T12:36:00+09:00
lastmod: 2021-05-30T18:48:31+09:00
tags:
- Jenkins
---

# jenkins ssh

考えてみたら当たり前って感じだけど、Slaveに鍵を置いていない場合、slaveからsshすることができない

## 解決方法

* 認証情報にJenkinsのssh鍵を設定

* ビルドの設定で、 `秘密テキストや秘密ファイルを使用する` にチェックして設定
  
  ````
  SSH User Private Key
                
  Key File Variable: SSH_KEY
  認証情報: 上記で設定した認証情報を選択
  ````

* シェル実行時に鍵ファイルを指定
  
  ````
  ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no <user>@<host> <some command>
````
