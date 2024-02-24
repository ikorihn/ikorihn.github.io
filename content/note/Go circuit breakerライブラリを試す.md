---
title: Go circuit breakerライブラリを試す
date: "2022-11-18T10:01:00+09:00"
tags:
  - Go
---

[[circuit breaker pattern]] をGoで実装したいので、いくつかのライブラリを試してみる。

## ライブラリ

metricsもとれる
https://github.com/cep21/circuit/
https://github.com/afex/hystrix-go 古い

bulk headなどcircuit breaker以外の機能もある
https://github.com/slok/goresilience metricsとれる
https://github.com/eapache/go-resiliency

circuit breakerのみ
https://github.com/mercari/go-circuitbreaker
https://github.com/sony/gobreaker
https://github.com/streadway/handy/tree/master/breaker
https://github.com/rubyist/circuitbreaker

[[Hystrix dashboard]] も使ってみると、サーキットの状態を見れておもしろい

### cep21/circuit

- Hystrixライクなサーキットブレーカーを提供するライブラリ
- 設定値は https://github.com/Netflix/Hystrix/wiki/Configuration を参考にできる
- メトリクスを取れる
- Prometheus で収集できる
- メモリアロケーションのコストが低い、ベンチマークがいい
- [[Hystrix dashboard]] をサポートしている

Prometheus で収集するにはこちらのライブラリを使う
https://github.com/jiacai2050/prometrics
これによって、サーキットのオープン回数、実行回数などがわかる

[[GoのメトリクスをPrometheusで収集する]]

実装例

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/cep21/circuit/closers/hystrix"
	"github.com/cep21/circuit/v3"
	"github.com/jiacai2050/prometrics"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type result struct {
	err error
	msg string
}

func newCircuitBreaker() *circuit.Circuit {
	// circuit breakerの設定
	hystrixConf := hystrix.Factory{
		ConfigureOpener: hystrix.ConfigureOpener{
			// サーキットをオープンするエラー率
			ErrorThresholdPercentage: 50,
			// 10回エラーになるまではサーキットをオープンしない
			RequestVolumeThreshold: 10,
		},
		ConfigureCloser: hystrix.ConfigureCloser{
			// サーキットがオープンになってからハーフオープンになるまでの時間
			SleepWindow: 2000 * time.Millisecond,
		},
	}

	// Prometheusで収集できるようにする
	prom := prometrics.GetFactory(prometheus.DefaultRegisterer)

	h := circuit.Manager{
		DefaultCircuitProperties: []circuit.CommandPropertiesConstructor{
			hystrixConf.Configure,
			prom.CommandProperties,
		},
	}
	// This circuit will inherit the configuration from the example
	c := h.MustCreateCircuit("hystrix-circuit")
	fmt.Println("This is a hystrix configured circuit", c.Name())

	return c
}

func main() {
	c := newCircuitBreaker()

	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.HandlerFor(prometheus.DefaultGatherer, promhttp.HandlerOpts{}))

	go func() {
		http.ListenAndServe(":8080", mux)
	}()

	results := make(chan result)

	// Run a infinite loop executing using our runner.
	go func() {
		for {
			time.Sleep(200 * time.Millisecond)

			// Execute concurrently.
			go func() {
				// Execute our call to the service.
				var msg string

				// Call the circuit
				err := c.Execute(context.Background(), func(ctx context.Context) error {
					now := time.Now()

					// If minute is mod 3 return error directly
					if now.Second()%10 == 0 {
						return fmt.Errorf("huge system error")
					}

					var err error
					switch time.Now().UnixMilli() % 10 {
					case 0:
						msg = "ok"
					case 2, 9:
						time.Sleep(750 * time.Millisecond)
						err = fmt.Errorf("a error")
					case 7:
						time.Sleep(5 * time.Second)
						msg = "ok"
					default:
						time.Sleep(20 * time.Millisecond)
						if rand.Intn(1000)%2 == 0 {
							msg = "ok"
						} else {
							err = fmt.Errorf("another error")
						}
					}

					return err
				}, func(ctx context.Context, err error) error {
					var ce circuit.Error
					if errors.As(err, &ce) {
						fmt.Println("circuit is open")
						return nil
					} else 
						return err
					}
				})

				// Send the result to our receiver outside this infinite loop.
				results <- result{
					err: err,
					msg: msg,
				}
			}()

		}
	}()

	// Process the received executions.
	for res := range results {
		if res.err != nil {
			fmt.Printf("[!] fallback because err received: %s\n", res.err)
		} else {
			fmt.Printf("[*] all ok: %s\n", res.msg)
		}
	}

}
```

```shell
go run main.go
```

`http://localhost:8080/metrics` を開くとgo_gcなど標準のメトリクスに加えてcircuitの状態が取得できるようになっている

```
# HELP circuit_failure_duration_seconds Duration of failed func run
# TYPE circuit_failure_duration_seconds histogram
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.005"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.01"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.025"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.05"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.1"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.25"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="0.5"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="1"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="2.5"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="5"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="10"} 2
circuit_failure_duration_seconds_bucket{func="fallback",name="hystrix-circuit",le="+Inf"} 2
circuit_failure_duration_seconds_sum{func="fallback",name="hystrix-circuit"} 1.6e-05
circuit_failure_duration_seconds_count{func="fallback",name="hystrix-circuit"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.005"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.01"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.025"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.05"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.1"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.25"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="0.5"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="1"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="2.5"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="5"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="10"} 2
circuit_failure_duration_seconds_bucket{func="run",name="hystrix-circuit",le="+Inf"} 2
circuit_failure_duration_seconds_sum{func="run",name="hystrix-circuit"} 0.000570084
circuit_failure_duration_seconds_count{func="run",name="hystrix-circuit"} 2
```


### afex/hystrix-go

Hystrix と名前に入っている通り、JavaのHystrixと同じように使用できる
goroutineで実行される
メトリクスを取る仕組みは組み込まれていない
最終コミットは2018年

```go
output := make(chan bool, 1)
errors := hystrix.Go("my_command", func() error {
	// talk to other services
	output <- true
	return nil
}, nil)

select {
case out := <-output:
	// success
case err := <-errors:
	// failure
}
```

### slok/goresilience

サーキットブレーカーに限らず、resilliencyを高めるためのパターンをいくつか提供している
Hystrixライク
Prometheusで収集できる
