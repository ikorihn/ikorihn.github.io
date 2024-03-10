---
title: aws cliでCloudWatchのメトリクスを取得する
date: 2024-03-06T22:34:00+09:00
tags:
  - AWS
---

```shell
aws cloudwatch get-metric-statistics \
  --namespace "SampleNamespace" \
  --metric-name "temperature" \
  --start-time "2024-03-06T14:00:00+09:00" \
  --end-time "2024-03-06T15:00:00+09:00" \
  --period 60 \
  --dimension Name=Service,Value=myapp \
  --statistics Average Maximum
```

- `--start-time`, `--end-time`: 時刻範囲指定
- `--period`: 何秒間隔でメトリクスを取得するか
