---
title: Jaeger
date: 2024-01-09T22:15:00+09:00
tags:
- Observability
---

{{< card-link "https://www.jaegertracing.io" >}}

複数のマイクロサービスにまたがる一連のイベントを視覚化し、アプリケーションを監視できるようにする分散トレーシングシステムの一つ。

これにより、複数マイクロサービスの処理が遅い箇所の特定、障害発生時の調査がしやすくなる。

Jaeger独自の形式で送信するためのSDKが各種言語向けにあるほか、 [OpenTelemetry](note/OpenTelemetry.md) に対応している。

Jaeger自体は [Go](note/Go.md) で実装されている。シングルバイナリで動作する他、[Docker](note/Docker.md)イメージも提供されている
