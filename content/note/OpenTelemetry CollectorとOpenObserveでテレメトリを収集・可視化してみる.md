---
title: OpenTelemetry CollectorとOpenObserveでテレメトリを収集・可視化してみる
date: 2024-03-29T15:25:00+09:00
tags:
  - Go
  - OpenTelemetry
---

[[OpenTelemetry CollectorとJeagerでテレメトリを収集・可視化してみる]] の [[OpenObserve]] 版

## Docker composeで立てる

```yaml:compose.yaml
version: "3"

services:
  openobserve:
    image: public.ecr.aws/zinclabs/openobserve:latest
    ports:
      - 5601:5601
    expose:
      - 5080
      - 5081
    volumes:
      - ./data:/data
    environment:
      - ZO_DATA_DIR=/data
      - ZO_HTTP_PORT=5601
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_PROMETHEUS_ENABLED=true

  otel-collector:
    image: otel/opentelemetry-collector:0.91.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - 4317:4317 # OTLP gRPC receiver
    depends_on:
      - openobserve
```

## OTEL Collector Configuration

認証ヘッダー付きでリクエストする。

```yaml:otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:

exporters:
  otlp:
    endpoint: openobserve:5081
    headers:
      Authorization: Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
      organization: default
      stream-name: your-stream
    tls:
      insecure: true
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200

extensions:
  health_check:
  pprof:
  zpages:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]

```

## アプリケーションを実装する

[Getting Started](https://opentelemetry.io/docs/instrumentation/go/getting-started/) のHTTP serverのコードをベースにする。
こちらのコードをコピペしてhttp serverを作ったら、`otel.go` のtraceExporterを次のように書き換え、Collectorに送信されるようにする

```go
func newTraceProvider(ctx context.Context, res *resource.Resource) (*trace.TracerProvider, error) {
	traceExporter, err := otlptracegrpc.New(ctx) // 向き先の設定などもこちらで行える。デフォルトはlocalhost:4317
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter,
			// Default is 5s. Set to 1s for demonstrative purposes.
			trace.WithBatchTimeout(time.Second)),
		trace.WithResource(res),
	)
	return traceProvider, nil
}
```

OTLP trace exporter using gRPC をgo getで入れる

```shell
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
```

[[Go]] のexporterの使い方はこちら
https://opentelemetry.io/docs/instrumentation/go/exporters/

## 実行してみる

```shell
❯ go run ./

❯ curl 'http://localhost:1323/rolldice'
```

画面で確認できた

![[Pasted-image-20240329033809.png]]

## まとめ

OpenObserveはログ、トレース、メトリクスすべて取れるので便利