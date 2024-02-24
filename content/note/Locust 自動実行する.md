---
title: Locust 自動実行する
date: 2024-01-17T16:37:00+09:00
tags:
  - Locust
---

[[Locust]] の起動後に自動で負荷試験を開始することができる

各設定値の詳細は[公式ドキュメント](https://docs.locust.io/en/stable/configuration.html)の通り

## Web UI + 自動実行

`--autostart` を指定する

## Web UIなしで自動実行

`--headless` を指定する

## 実行時間やユーザー数の設定

- `--expect-workers`: workerが指定した数起動してから負荷試験を開始します
- `-u, --users`: 実行ユーザー数
- `-r, --spawn-rate`: ユーザー数増加レート(秒間何ユーザーずつ増加させるか。 `1/5s` や `2` のように指定できる)
- `-t, --run-time`: 負荷試験実行時間

## `--run-time` 指定時の注意

[[Locustのライフサイクルフックについて]]

