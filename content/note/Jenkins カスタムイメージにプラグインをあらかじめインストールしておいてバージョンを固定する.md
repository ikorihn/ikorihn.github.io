---
title: Jenkins カスタムイメージにプラグインをあらかじめインストールしておいてバージョンを固定する
date: 2024-02-15T17:42:00+09:00
tags:
  - Jenkins
---

[[Jenkins]] のmasterを [[Docker]] コンテナで運用していて、プラグインのバージョンだけ上がると本体のバージョンと不整合を起こして起動しなくなることが多々あった。
プラグインのバージョンもなるべく固定できないかを検討した。

## カスタムイメージを作る

https://github.com/jenkinsci/helm-charts/tree/main/charts/jenkins#consider-using-a-custom-image で紹介されている方法を試す。

```Dockerfile
FROM jenkins/jenkins:latest

COPY installPlugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt
```

```txt title:installPlugins.txt
configuration-as-code:1775.v810dc950b_514
git:5.2.1
kubernetes:4186.v1d804571d5d4
role-strategy:689.v731678c3e0eb_
```

これでdocker buildすると `/usr/share/jenkins/ref/plugins` と `$JENKINS_HOME/plugins` にプラグインファイルが配置済みのイメージができあがる。
あとはこのイメージでJenkinsを起動するようにすれば、バージョンが固定されていて問題が起こりにくい。

## プラグインを追加する

Jenkins環境が1つだけならよいが、チームごとにJenkinsサーバーを立てたいといった場合に、カスタムイメージにインストールされているプラグインの他に、個々のユーザーでプラグインを追加する方法を検討する。

[Jenkins Helm Chart](https://github.com/jenkinsci/helm-charts/blob/56323ad0fae2403aeb33b1fabb13ec15a573347c/charts/jenkins/templates/config.yaml#L32-L44) でやっている方法を真似ることにする。

```shell
$ cd $JENKINS_HOME
$ rm -rf plugins/*
$ rm -rf /usr/share/jenkins/ref/plugins/*.lock
# plugins.txtにはインストールしたいプラグインのリストが書かれている
$ jenkins-plugin-cli -f plugins.txt -d plugins
$ cp /usr/share/jenkins/ref/plugins/* plugins/
```

こうすると、
1. pluginsをクリーンする
2. 追加したいプラグインのみまずインストールする
3. 再度、あらかじめインストール済みのプラグインファイルで上書きする

これで、もし追加プラグインと同じプラグインが依存関係で入ったとしても、あらかじめインストール済みのプラグインのバージョンに上書きされるようになる。
それはそれでバージョンミスマッチが起こりそうではあるが、どちらのほうが問題が起こる可能性が高いか次第で決めればいいと思う。
