---
title: etcd
date: 2023-07-19T17:08:00+09:00
tags:
- 2023/07/19
---

{{< card-link "https://etcd.io" >}}

分散型のキーバリューストア
Go言語製
複数台で実行してクラスターを構築することで負荷分散を行う

[etcdctl](note/etcdctl.md) で操作できる。

## docker composeでクラスターを構築する

## etcdのバックアップを取る

## リソース使用量チューニング

### snapshot取得のしきい値を下げる

https://etcd.io/docs/v3.5/op-guide/maintenance/#raft-log-retention
https://etcd.io/docs/v3.5/tuning/#snapshots
etcdはログファイルにすべてのキーの変更履歴を書きこむ。
ログが巨大にならないようにするため、定期的にsnapshotを取るといい。
デフォルトの --snapshot-count は100,000なので、10万件のログをメモリに保持する。

### 履歴データの圧縮

データの変更履歴を保持しており、更新が多いユースケースだと履歴がメモリを圧迫する。
compactionすることで、圧縮することができる。

https://juicefs.com/docs/community/etcd_best_practices/
https://etcd.io/docs/v3.5/op-guide/maintenance/#auto-compaction

````
ETCD_AUTO_COMPACTION_MODE=revision
ETCD_AUTO_COMPACTION_RETENTION=1000
````

これだと、5分おきに最新から1000リビジョン以前の履歴をcompactionする。
