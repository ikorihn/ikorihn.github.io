---
title: dockerからcontainerdに移行したらコンテナログのフォーマットが変わった
date: 2024-02-13T13:09:00+09:00
tags:
  - Docker
---

[[Fluentd]] でコンテナログを転送しているのだが、[[Kubernetes]] のバージョンを上げてコンテナランタイムがcontainerdに変わってからログが転送されなくなった。
調べたらdockerのときは `/var/log/containers` にJSONで出力されていたログが、containerdでは `[timestamp] stderr F [time] ...` のような1行形式に変わっていた。
[Kubernetesのコンテナランタイムがcontainerd場合のFluent Bitでのログ転送について - ブログ - 株式会社Smallit（スモーリット）](https://smallit.co.jp/blog/958/)

https://github.com/fluent/fluentd-kubernetes-daemonset/issues/412

```conf
<system>
  rpc_endpoint 127.0.0.1:24444
</system>
<source>
  @type tail
  path "/var/log/containers/my-container.log"
  tag container-log
  <parse>
    @type /^(?<time>.+) (?<stream>stdout|stderr) [^ ]* (?<log>.*)$/
    time_format %Y-%m-%dT%H:%M:%S.%NZ
  </parse>
  pos_file /fluentd/logs/my-container.log.pos
</source>

<match container-log>
  @type stdout
  <buffer>
    flush_mode immediate
  </buffer>
</match>
```

## プレーンテキストになったことでもうひと工夫必要

複数行に渡ってログが出力されるとき、grepでは先頭の行しか拾えないので、もしJavaのスタックトレースなどで形式がマッチしない場合は工夫がいる。
自分のケースでは使わなかった。

[multiline Parser](https://docs.fluentd.org/parser/multiline) を使うのがよさげ

```conf
<parse>
  @type multiline
  format_firstline /\d{4}-\d{1,2}-\d{1,2}/
  format1 /^(?<time>\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}) \[(?<thread>.*)\] (?<level>[^\s]+)(?<message>.*)/
</parse>
```
