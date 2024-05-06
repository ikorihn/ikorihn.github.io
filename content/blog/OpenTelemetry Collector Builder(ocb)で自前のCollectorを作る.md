---
title: OpenTelemetry Collector Builder(ocb)で自前のCollectorを作る
date: 2024-05-02T12:04:00+09:00
tags:
  - OpenTelemetry
---

[[OpenTelemetry Collector]] を使用する際には [OpenTelemetry Collector distributions](https://github.com/open-telemetry/opentelemetry-collector-releases) で提供されているディストロをよく使います。
中でも [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)には開発中のものも含め様々な種類のコンポーネントが含まれているので、テスト目的には便利です。

一方で不要なコンポーネントも含まれておりサイズやセキュリティリスクの問題があるため、本番環境で使用する際には必要なコンポーネントのみを含んだCollectorをビルドすることが推奨されています。
> Users of the OpenTelemetry Collector are also encouraged to build their own custom distributions with the [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder), using the components they need from the core repository, the contrib repository, and possibly third-party or internal repositories.

Contrib外の [AWS Distro for OpenTelemetry](https://aws-otel.github.io/docs/) と他のコンポーネントを組み合わせたい、といった場合にも便利です。

ビルドには[OpenTelemetry Collector Builder(ocb)](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)を使用します。
ここからはocbを使ったOTel Collector のビルド方法について紹介します。

## ocbのインストール

```shell
$ go install go.opentelemetry.io/collector/cmd/builder@latest
$ builder version
ocb version v0.99.0
```

## 設定ファイルを作成する

Collectorにどのコンポーネント(exporter, receiver, processorなど)を含めるかをYAMLファイルに記述します。

```yaml:title=ocb-config.yaml
dist:
    name: otelcol-custom # the binary name. Optional.
    description: "Custom OpenTelemetry Collector distribution" # a long name for the application. Optional.
    output_path: ./bin # the path to write the output (sources and binary). Optional.

exporters:
  - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.99.0
  - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/exporter/prometheusexporter v0.99.0
  
receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/awsecscontainermetricsreceiver v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver v0.99.0
 
processors:
  - gomod: go.opentelemetry.io/collector/processor/batchprocessor v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/tailsamplingprocessor v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/attributesprocessor v0.99.0
 
extensions:
  - gomod: go.opentelemetry.io/collector/extension/zpagesextension v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/extension/sigv4authextension v0.99.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/extension/healthcheckextension v0.99.0
```

コンポーネントは[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector) や [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) などから探してください。

## ビルドする

yamlをもとに指定したコンポーネントを含んだCollectorを作成します。

```shell
$ builder --config=ocb-config.yaml
$ ls bin
components.go  go.mod  go.sum  main.go  main_others.go  main_windows.go  otelcol-custom*
```

`--skip-compilation` をつけるとsource codeとgo.modの生成のみが行われます。この生成されたファイルをコミットしておけば、CI上ではocbをインストールせずビルドすることもできそうです。
```shell
$ builder --config=ocb-config.yaml --skip-compilation
$ ls bin
components.go  go.mod  go.sum  main.go  main_others.go  main_windows.go
```

## Dockerコンテナを作成する

[[Docker]] で実行するためにコンテナイメージを作成します。
[GoogleCloudPlatform/opentelemetry-collector-builder-sample](https://github.com/GoogleCloudPlatform/opentelemetry-collector-builder-sample) にサンプル集もあります。

```dockerfile
FROM gcr.io/distroless/base-debian12

COPY ./bin/otelcol-custom /app/otelcol-custom
EXPOSE 8888 8889 4317 4318 55679

ENTRYPOINT ["/app/otelcol-custom"]
```

マルチステージビルドの場合は以下のようになります。

```dockerfile
FROM public.ecr.aws/docker/library/golang:1.22 as builder

WORKDIR /app
RUN go install go.opentelemetry.io/collector/cmd/builder@latest
COPY otel-col-builder.yaml otel-col-builder.yaml
RUN CGO_ENABLED=0 builder --config=otel-col-builder.yaml

FROM gcr.io/distroless/base-debian12

COPY --from=builder /app/bin/otelcol-custom /app/otelcol-custom
EXPOSE 8888 8889 4317 4318 55679

ENTRYPOINT ["/app/otelcol-custom"]
```

## 実行してみる

OTel Collector用の設定ファイルを用意して、Docker Composeで起動します。
[[OpenTelemetry CollectorとJeagerでテレメトリを収集・可視化してみる|Jeagerを使ってみます]]

```yaml:title=otelcol-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:

exporters:
  otlp:
    endpoint: jeager:4317
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp, debug]
```

```yaml
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
    build:
      context: ./
      dockerfile: Dockerfile
    command: ["--config=/etc/otelcol-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - 4317:4317 # OTLP gRPC receiver
    depends_on:
      - jaeger
```

`docker compose up --build` で起動すると、ログが確認できます。

```
2024-05-01T11:04:53.979Z        info    service@v0.99.0/service.go:99   Setting up own telemetry...
2024-05-01T11:04:53.979Z        info    service@v0.99.0/telemetry.go:103        Serving metrics {"address": ":8888", "level": "Normal"}
2024-05-01T11:04:53.979Z        info    exporter@v0.99.0/exporter.go:275        Development component. May change in the future.        {"kind": "exporter", "data_type": "traces", "name": "debug"}
2024-05-01T11:04:53.984Z        info    service@v0.99.0/service.go:166  Starting otelcol-custom...      {"Version": "1.0.0", "NumCPU": 2}
2024-05-01T11:04:53.984Z        info    extensions/extensions.go:34     Starting extensions...
```

## おわり

- 公式に提供されているOpenTelemetry Collectorは自分が使わないコンポーネントも含むので、必要なコンポーネントのみを含んだCollectorをビルドすることが推奨される
- ocbを使うとyamlファイルで設定して簡単にビルドできる