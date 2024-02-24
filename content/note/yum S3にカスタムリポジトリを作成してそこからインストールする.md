---
title: yum S3にカスタムリポジトリを作成してそこからインストールする
date: "2023-04-05T16:47:00+09:00"
tags:
  - '2023/04/05'
  - 'Linux'
lastmod: "2023-04-05T16:47:00+09:00"
---

自前のyumリポジトリサーバを構築し、そのリポジトリからインストールできるようにする。

## 参考

[(CentOS7)プライベート環境に必要なパッケージのみ提供するyumリポジトリサーバを構築する - zaki work log](https://zaki-hmkc.hatenablog.com/entry/2020/03/08/222941)
[S3にyumリポジトリを作成してプライベートサブネットから参照する | Awstut](https://awstut.com/2022/03/19/yum-repository-in-s3/)


## 手順

### ディレクトリを作成

とりあえず `/tmp/repo` に作る

```shell
mkdir -p /tmp/repo/
```

### 配置したいrpmパッケージをダウンロード

curlやwgetでも良いが、今回は `yumdownloader` を使う。入っていなければ `yum install yum-utils`
zstdのrpmを入れてみる

```shell
$ cd /tmp/repo
$ yumdownloader zstd
```

### リポジトリ作成

createrepoをインストールして使う

```shell
$ yum install createrepo

$ createrepo -v /tmp/repo
Spawning worker 0 with 1 pkgs
Spawning worker 1 with 0 pkgs
Worker 0: reading zstd-1.5.2-1.amzn2.x86_64.rpm
Workers Finished
Saving Primary metadata
Saving file lists metadata
Saving other metadata
Generating sqlite DBs
Sqlite DBs complete
```

### S3へアップロード

```shell
$ aws s3 cp /tmp/repo s3://my-bucket/repos/ --recursive
```


## 利用側の手順

### リポジトリを設定

```shell
$ vi /etc/yum.repos.d/myprivate.repo
```

```conf
[myprivate]
enabled=1
gpgcheck=0
name=my repo
baseurl=https://myrepository.example.com/repos
```

### 更新

```shell
$ yum makecache fast
```

### 確認

```shell
$ yum repolist all

myprivateが存在する
```

### インストール

一時的に設定済みのrepoを無効化して、これだけが使われるようにしてみる

```shell
$ yum --disablerepo=* --enablerepo=myprivate install zstd
```

