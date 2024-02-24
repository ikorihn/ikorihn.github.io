---
title: CentOS7とAmazonLinux2のDockerコンテナで日本語ロケールを設定する
date: "2023-04-04T17:35:00+09:00"
tags:
  - '2023/04/04'
  - 'Linux'
lastmod: "2023-04-04T17:37:00+09:00"
---

JavaのDateFormatterで、曜日を日本語表示しようとしたときに、ja_JPロケールが入っておらずできなかったので、方法を調べた。

## CentOS7

参考:
- [CentOS 7 コンテナに消えない日本語ロケールを追加する - Qiita](https://qiita.com/teruo-oshida/items/08cb84efc2b581b0a439)
- [CentOSで日本語ロケール設定にするDockerfile - BLOG - siwa32.com](https://blog.siwa32.com/docker_centos_ja/)

Dockerのcentos7はデフォルトではja_JPのロケールが入っていない。

```shell
$ locale -a | grep ja | wc -l
0
```

`/etc/yum.conf` に以下の設定が入っていることで、localeがen_US.utf8に制限されているためこれをいじればよい。

```conf
override_install_langs=en_US.utf8
```

`override_install_langs` の設定を消すか、 ja_JP.utf8 を追加するのだが、消すと使わないロケールもすべて入ってしまうので、追加するほうがいいだろう

```shell
$ sed -i -e '/override_install_langs/s/$/,ja_JP.utf8/g' /etc/yum.conf
```

この設定をしたあとでglibcを更新すると、ja_JPが使えるようになる

```shell
$ yum reinstall -y glibc-common
$ locale -a | grep ja
ja_JP
ja_JP.eucjp
ja_JP.ujis
ja_JP.utf8
japanese
japanese.euc
```

Dockerfile

```Dockerfile
FROM centos:7

RUN sed -i -e '/override_install_langs/s/$/,ja_JP.utf8/g' /etc/yum.conf
RUN yum reinstall -y glibc-common && yum clean all

ENV LANG ja_JP.UTF-8

CMD ["bash"]
```

ときどき `yum update -y && yum reinstall -y glibc-common` をしているDockerfileを見かけて、どういう意味があるんだろーと思っていたので謎がとけた

## AmazonLinux2

現在のLocaleを確認
```shell
$ localectl status
System Locale: LANG=en_US.UTF-8×Dismiss this alert.
```

Localeで設定できる値を確認
```shell
$ localectl list-locales
```

Localeを変更
```shell
$ localectl set-locale LANG=ja_JP.utf8
```

### Dockerコンテナ

参考:
- [AmazonLinux2のDockerイメージに日本語ローケルを設定してみました。 - Qiita](https://qiita.com/yuyj109/items/a56e562599972eb37abd)

Dockerコンテナ内でlocalectlを打つと、privilegedでないと `Failed to create bus connection` というエラーが出るので、別のやり方でインストールする。

yumで `glibc-langpack-ja` があるので、こちらをインストールする

```shell
$ yum install -y glibc-langpack-ja
...
Installed:
  glibc-langpack-ja.x86_64 0:2.26-27.amzn2.0.4                                                                                                                                                              

Complete!

$ locale -a | grep ja
ja_JP.eucjp
ja_JP.utf8

$ export LANG='ja_JP.utf8'
$ locale
LC_CTYPE="ja_JP.utf8"
LC_NUMERIC="ja_JP.utf8"
LC_TIME="ja_JP.utf8"
LC_COLLATE="ja_JP.utf8"
LC_MONETARY="ja_JP.utf8"
LC_MESSAGES="ja_JP.utf8"
LC_PAPER="ja_JP.utf8"
LC_NAME="ja_JP.utf8"
LC_ADDRESS="ja_JP.utf8"
LC_TELEPHONE="ja_JP.utf8"
LC_MEASUREMENT="ja_JP.utf8"
LC_IDENTIFICATION="ja_JP.utf8"
LC_ALL=

```

Dockerfile

```Dockerfile
FROM amazonlinux:2

RUN yum install -y glibc-langpack-ja && yum clean all
ENV LANG ja_JP.utf8
```
