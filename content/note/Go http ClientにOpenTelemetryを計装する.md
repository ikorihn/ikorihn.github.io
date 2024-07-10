---
title: Go http ClientにOpenTelemetryを計装する
date: 2024-05-27T17:08:00+09:00
---

[[OpenTelemetry]] には自動計装の仕組みがあり、たとえば [[Java]] だと [[Java OpenTelemetry agentによる自動計装|javaagent]] により実行時にバイトコードを変更することで、ソースコードを変更することなく計装することができる。

[[Go]] にもそのためのツールがある -> https://github.com/open-telemetry/opentelemetry-go-instrumentation
これは [[eBPF]] を使用して実装されている。
しかし2024-05-27現在開発中のステータスなので、本番への投入はためらわれる。

そこで、時間のかかる処理=HTTP通信とDBでトレースを取れればよいと割り切って計装する。

## http.Clientへの計装

http.Client は go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp を用いてある程度簡単に計装できる。
`otelhttp.NewTransport` でラップした `http.RoundTripper` を `http.Client.Transport` にセットすることで、contextを渡すと自動でspanを作ってくれる。

```go
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConnsPerHost = 200

	hc = &http.Client{
		Transport: otelhttp.NewTransport(transport),
	}

```

サンプルはこちら https://github.com/open-telemetry/opentelemetry-go-contrib/blob/main/instrumentation/net/http/otelhttp/example/client/client.go

sdkの初期化を含めた全体は以下のようになる。

```go
package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

var hc *http.Client

func main() {

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	traceProvider, err := initTracer(ctx)
	if err != nil {
		panic(err)
	}

	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := traceProvider.Shutdown(ctx); err != nil {
			log.Fatal("Error shutting down tracer provider", "err", err)
		}
	}()

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConnsPerHost = 200

	hc = &http.Client{
		Transport: otelhttp.NewTransport(transport),
	}

	tr := otel.Tracer("example/client")
	ctx, span := tr.Start(ctx, "http request")
	defer span.End()

	if err := do(ctx); err != nil {
		panic(err)
	}

}

func initTracer(ctx context.Context) (*sdktrace.TracerProvider, error) {
	exporter, err := stdouttrace.New(
		stdouttrace.WithPrettyPrint(),
		stdouttrace.WithWriter(os.Stderr),
	)

	if err != nil {
		return nil, err
	}

	traceRes, err := resource.New(ctx,
		resource.WithAttributes(semconv.ServiceName("my-service")),
	)
	if err != nil {
		return nil, err
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(traceRes),
	)

	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp, nil
}

func do(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, "GET", "http://example.com", nil)
	if err != nil {
		return err
	}
	res, err := hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	fmt.Printf("body: %s", string(b))
	return nil
}

```


## also see

[[Go sql DBにOpenTelemetryのSpanを追加する|Go sql.DB にOpenTelemetryのSpanを追加する]]