---
title: AWS ElasticacheのAuto Discoveryを利用する
date: 2023-11-16T12:45:00+09:00
tags:
  - Go
  - AWS
---

## Auto Discoveryについて

- [Using Auto Discovery - Amazon ElastiCache](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/AutoDiscovery.Using.html)
- [Use the Auto Discovery service  |  Memorystore for Memcached  |  Google Cloud](https://cloud.google.com/memorystore/docs/memcached/use-auto-discovery)

Amazon ElastiCache や Google Cloudの[Memorystore for Memcached](https://cloud.google.com/memorystore/docs/memcached) には、クラスタで構築されたmemcachedのノードを自動検出する機能がある。
この機能を使うと、クライアントはノードがスケールイン/アウトした際に検知して、自動的に接続先を再設定しなおす。

これは標準のmemcachedに備わっている機能ではないので、クライアントライブラリによっては実装されていない。

## どうやってノードを検出するか

Auto Discoveryを利用する際には、各ノードのエンドポイントのかわりに、 discovery endpoint をクライアントに設定する。

telnet でdiscovery endpointに接続して、以下コマンドを打つとクラスタのノード一覧が取得できる。
```
config get cluster
```

出力形式は次のようなもの
```
CONFIG cluster 0 [length-of-payload-in-next-two-lines]
[integer]
[node1-ip]|[node1-ip]|[node1-port][node2-ip]|[node2-ip]|[node2-port]
\r\n
END\r\n
```

例
```
CONFIG cluster 0 136\r\n
12\n
myCluster.pc4ldq.0001.use1.cache.amazonaws.com|10.82.235.120|11211 myCluster.pc4ldq.0002.use1.cache.amazonaws.com|10.80.249.27|11211\n\r\n 
END\r\n
```

こうして定期的に取得したエンドポイント一覧をmemcachedの接続先リストに設定することで増減に対応できる。

## クライアントライブラリ

Javaの参照実装
https://github.com/awslabs/aws-elasticache-cluster-client-memcached-for-java

Goのライブラリ
https://github.com/google/gomemcache

