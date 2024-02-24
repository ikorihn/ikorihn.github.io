---
title: EC2のuserdata の内容を確認する
date: "2023-05-05T20:25:00+09:00"
tags:
  - EC2
  - AWS
---


```shell
$ cd /var/lib/cloud/instances/i-<インスタンスID>/
$ ls -al
total 68
drwxr-xr-x 5 root root   218 Jul 14 18:00 .
drwxr-xr-x 3 root root    33 Jul 14 17:59 ..
-rw-r--r-- 1 root root    59 Jul 14 18:00 boot-finished
-rw------- 1 root root     0 Jul 14 17:59 cloud-config.txt
-rw-r--r-- 1 root root    29 Jul 14 17:59 datasource
drwxr-xr-x 2 root root     6 Jul 14 17:59 handlers
-r-------- 1 root root 25855 Jul 14 17:59 obj.pkl
drwxr-xr-x 2 root root    22 Jul 14 17:59 scripts
drwxr-xr-x 2 root root  4096 Jul 14 18:00 sem
-rw------- 1 root root  9945 Jul 14 17:59 user-data.txt
-rw------- 1 root root 10288 Jul 14 17:59 user-data.txt.i
-rw------- 1 root root     0 Jul 14 17:59 vendor-data.txt
-rw------- 1 root root   345 Jul 14 17:59 vendor-data.txt.i
$ cat user-data.txt
=> userdataのスクリプト
```

