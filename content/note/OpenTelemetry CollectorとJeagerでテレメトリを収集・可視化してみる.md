---
title: OpenTelemetry CollectorとJeagerでテレメトリを収集・可視化してみる
date: 2023-12-20T17:59:00+09:00
tags:
- Go
- OpenTelemetry
---

[OpenTelemetry](note/OpenTelemetry.md) ではアプリケーションから直接トレーシングサービスにexportする以外にもCollectorを挟むことができる。
https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo の図がわかりやすい。

これによってアプリケーションのコードはexport先を意識しなくてすみ、データの変換やsamplingをしたり、複数のexport先を設定したりと言ったことが可能になる。

## Docker compose

https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/examples/demo/docker-compose.yaml
を参考にして最小限の構成にする

````yaml:compose.yaml
version: "3"

services:
  jaeger:
    image: "jaegertracing/all-in-one:1.52"
    ports:
      - "16686:16686"
    expose:
      - 4317
      - 4318
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
      - COLLECTOR_OTLP_ENABLED=true
  # Collector
  otel-collector:
    image: otel/opentelemetry-collector:0.91.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - 4317:4317 # OTLP gRPC receiver
    depends_on:
      - jaeger
````

Jaegerの各portの意味はこちらで確認する。
https://www.jaegertracing.io/docs/1.52/getting-started/

## OTEL Collector Configuration

https://opentelemetry.io/docs/collector/configuration/
を参考に `otel-collector-config.yaml` を作成する

````yaml:otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:

exporters:
  otlp:
    endpoint: jaeger:4317
    tls:
      insecure: true

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
````

[Jaeger](note/Jaeger.md) がOTLPをサポートしたことに伴い、
[opentelemetry-collector v0.86.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.86.0) で
[jaeger exporter は削除され](https://github.com/open-telemetry/opentelemetry-specification/pull/2858)、otlp exporterでexportできるようになっている。

ちなみにjaeger exporterを指定すると以下のようなエラーが出る。
`* error decoding 'exporters': unknown type: "jaeger" for id: "jaeger" (valid values: [kafka prometheus prometheusremotewrite debug logging otlphttp file otlp opencensus zipkin])`

## アプリケーションを実装する

[Getting Started](https://opentelemetry.io/docs/instrumentation/go/getting-started/) のHTTP serverのコードをベースにする。
こちらのコードをコピペしてhttp serverを作ったら、`otel.go` のtraceExporterを次のように書き換え、Collectorに送信されるようにする

````go
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
````

OTLP trace exporter using gRPC をgo getで入れる

````shell
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
````

[Go](note/Go.md) のexporterの使い方はこちら
https://opentelemetry.io/docs/instrumentation/go/exporters/

## 実行してみる

````shell
❯ go run ./

❯ curl 'http://localhost:1323/rolldice'
````

Jaeger (http://localhost:16686) できちんと送信されているのが確認できた

![](note/Pasted-image-20231220073520.png)

## まとめ

Collectorを挟むとアプリケーションは楽に実装できそう。
[Prometheus](note/Prometheus.md) とJaeger両方に送信するってことも簡単なのでよさげ
