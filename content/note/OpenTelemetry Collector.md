---
title: OpenTelemetry Collector
date: 2024-05-02T12:05:00+09:00
tags:
  - OpenTelemetry
---
[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) はアプリケーションから取得したテレメトリデータをオブザーバビリティサービスに送信するコンポーネント。

[[OpenTelemetry]] ではアプリケーションから直接送信することもできるが、OTel Collectorを間に挟むことでアプリケーションはexport先を意識しなくてよくなる。
データの変換やsamplingをしたり、複数のexport先を設定したりできて、例えば [[Prometheus]] 形式でエクスポートされたメトリクスをOTel Collectorで収集してOpenTelemetry形式に変換して送信するといったことも可能となる。
