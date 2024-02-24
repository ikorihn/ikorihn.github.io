---
title: OpenTelemetry
date: 2023-12-12T13:34:00+09:00
tags:
  - Observability
lastmod: 2023-12-12T13:34:50+09:00
---

{{< card-link "https://opentelemetry.io" >}}

- テレメトリー = ログ、メトリクス、トレースを収集するには基本的に計装(instrumentation)が必要
- OpenTelemetryの仕様で計装すれば、対応しているサービスであれば収集できる
    - 特定のモニタリングサービスのSDKを使って実装すると、そのサービスにしか送信できない
- OpenTelemetry のエコシステムで様々な言語、ツール向けの計装ライブラリを提供している
    - GoのEcho用とか、net/http用とかPostresQL用とか

## 自動計装

コードに実装せずに自動で計装してくれる。

- [[Java]] の場合、Java Agentの仕組みを使ってアプリ実行時にバイトコードを動的にインジェクトする
- [[Python]] もアプリ実行時に動的インジェクトする
- exporterや送信先は環境変数でも設定可能

