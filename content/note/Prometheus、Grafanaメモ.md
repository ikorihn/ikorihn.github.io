---
title: Prometheus、Grafanaメモ
date: 2023-05-05T20:20:00+09:00
tags:
- 監視
---

### count_over_time

time rangeの間、intervalごとにメトリクスを収集した件数の合計

`count_over_time((kube_pod_status_phase{phase="Pending"} > 0)[15m:1m])`
15分の間に1分ごとにpendingの件数をカウントして合計する
