---
title: etcdctl
date: "2023-07-19T17:09:00+09:00"
tags: 
    - '2023/07/19'
---

[[etcd]]のクライアント

etcdをインストールすると使えるようになるが、クライアントだけほしい場合もある。
[[Go]]なので `go install github.com/etcd-io/etcd/etcdctl@latest` で入るかと思ったがこれではエラーになってしまったので、一旦git cloneしてから入れた。

```shell
git clone https://github.com/etcd-io/etcd.git
cd etcd/etcdctl
go install

etcdctl version
```

```shell
etcdctl --endpoints= version
```
