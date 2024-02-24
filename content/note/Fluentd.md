---
title: Fluentd
date: 2024-02-13T16:23:00+09:00
---

OSSのログ収集ツール。
サーバー上のログデータを収集、フィルタリングして、別のログ収集先へ転送することができる。


```yaml
version: "3.5"

services:
  fluentd:
    image: public.ecr.aws/docker/library/fluentd:v1.16-debian-1
    environment:
      - FLUENTD_CONF=fluent.conf
    volumes:
      - ./config:/fluentd/etc
      - ./logs:/logs

```

```conf title:config/fluent.conf
<source>
  @type tail
  path "/logs/test.log"
  tag test-log
  read_from_head
  <parse>
    @type /^(?<time>.+) (?<stream>stdout|stderr) [^ ]* (?<log>.*)$/
    time_format %Y-%m-%dT%H:%M:%S.%NZ
  </parse>
  pos_file /logs/test.log.pos
</source>

<filter test-log>
  @type grep
  <regexp>
    key log
    pattern (error|Exception)
  </regexp>
  <exclude>
    key log
    pattern (ClientException|WARNING)
  </exclude>
</filter>

<match test-log>
  @type stdout
  <buffer>
    flush_mode immediate
  </buffer>
</match>
```
