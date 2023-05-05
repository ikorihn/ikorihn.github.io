---
title: GoのメトリクスをPrometheusで収集する
date: 2022-11-22T16:48:00+09:00
tags:
- Go
- Prometheus
---

## http.ServerのメトリクスをPrometheusで出力する

https://prometheus.io/docs/tutorials/instrumenting_http_server_in_go/

````go
package main

import (
   "fmt"
   "net/http"

   "github.com/prometheus/client_golang/prometheus"
   "github.com/prometheus/client_golang/prometheus/promhttp"
)

var pingCounter = prometheus.NewCounter(
   prometheus.CounterOpts{
       Name: "ping_request_count",
       Help: "No of request handled by Ping handler",
   },
)

func ping(w http.ResponseWriter, req *http.Request) {
   pingCounter.Inc()
   fmt.Fprintf(w, "pong")
}

func main() {
   prometheus.MustRegister(pingCounter)

   http.HandleFunc("/ping", ping)
   http.Handle("/metrics", promhttp.Handler())
   http.ListenAndServe(":8090", nil)
}
````

### Echoの場合

````go
package main

import (
	"net/http"

	promMiddleware "github.com/labstack/echo-contrib/prometheus"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// /metrics でメトリクス情報が取れる
	pm := promMiddleware.NewPrometheus("echo", nil)
	pm.Use(e)

	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "pong")
	})

	e.Logger.Fatal(e.Start(":1323"))
}
````

## 自作のExporterを作る

[Golangで簡単にPrometheusのExporterを作れる。 - ry's Tech blog](https://ryo-xjsbx.hatenablog.com/entry/prometheus-exporter-with-golang)

`prometheus.Collector` interfaceを満たすように作成して登録すればいい。

https://github.com/dgraph-io/ristretto (キャッシュライブラリ)でメトリクスをとってみる

````go
package main

import (
	"github.com/dgraph-io/ristretto"
	"github.com/prometheus/client_golang/prometheus"
)

// CacheStatsCollector implements the prometheus.Collector interface.
type CacheStatsCollector struct {
	cache *ristretto.Cache

	// descriptions of exported metrics
	hitsDesc                  *prometheus.Desc
	missesDesc                *prometheus.Desc
	keysAddedDesc             *prometheus.Desc
	keysUpdatedDesc           *prometheus.Desc
	keysEvictedDesc           *prometheus.Desc
	costAddedDesc             *prometheus.Desc
	costEvictedDesc           *prometheus.Desc
	getsDroppedDesc           *prometheus.Desc
	getsKeptDesc              *prometheus.Desc
	ratioDesc                 *prometheus.Desc
	lifeExpectancySecondsDesc *prometheus.Desc
}

// NewCacheStatsCollector for prometheus.
func NewCacheStatsCollector(cache *ristretto.Cache) *CacheStatsCollector {
	labels := prometheus.Labels{"name": "ristretto"}

	return &CacheStatsCollector{
		cache:                     cache,
		hitsDesc:                  prometheus.NewDesc("ristretto_hits_total", "The number of hits in the cache.", nil, labels),
		missesDesc:                prometheus.NewDesc("ristretto_misses_total", "The number of misses in the cache.", nil, labels),
		keysAddedDesc:             prometheus.NewDesc("ristretto_keys_added", "The number of keys added in the cache.", nil, labels),
		keysUpdatedDesc:           prometheus.NewDesc("ristretto_keys_updated", "The number of keys updated in the cache.", nil, labels),
		keysEvictedDesc:           prometheus.NewDesc("ristretto_keys_evicted", "The number of keys evicted in the cache.", nil, labels),
		costAddedDesc:             prometheus.NewDesc("ristretto_cost_added", "The number of cost added in the cache.", nil, labels),
		costEvictedDesc:           prometheus.NewDesc("ristretto_cost_evicted", "The number of cost evicted in the cache.", nil, labels),
		getsDroppedDesc:           prometheus.NewDesc("ristretto_gets_dropped", "The number of gets dropped in the cache.", nil, labels),
		getsKeptDesc:              prometheus.NewDesc("ristretto_gets_kept", "The number of gets kept in the cache.", nil, labels),
		ratioDesc:                 prometheus.NewDesc("ristretto_ratio", "The hit ratio of the cache.", nil, labels),
		lifeExpectancySecondsDesc: prometheus.NewDesc("ristretto_life_expectancy_seconds", "The seconds of life expectancy of the cache.", nil, labels),
	}
}

// Describe implements the prometheus.Collector interface.
func (c CacheStatsCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.hitsDesc
	ch <- c.missesDesc
	ch <- c.keysAddedDesc
	ch <- c.keysUpdatedDesc
	ch <- c.keysEvictedDesc
	ch <- c.costAddedDesc
	ch <- c.costEvictedDesc
	ch <- c.getsDroppedDesc
	ch <- c.getsKeptDesc
	ch <- c.ratioDesc
	ch <- c.lifeExpectancySecondsDesc
}

// Collect implements the prometheus.Collector interface.
func (c CacheStatsCollector) Collect(ch chan<- prometheus.Metric) {
	metrics := c.cache.Metrics

	ch <- prometheus.MustNewConstMetric(c.hitsDesc, prometheus.CounterValue, float64(metrics.Hits()))
	ch <- prometheus.MustNewConstMetric(c.missesDesc, prometheus.CounterValue, float64(metrics.Misses()))
	ch <- prometheus.MustNewConstMetric(c.keysAddedDesc, prometheus.CounterValue, float64(metrics.KeysAdded()))
	ch <- prometheus.MustNewConstMetric(c.keysUpdatedDesc, prometheus.CounterValue, float64(metrics.KeysUpdated()))
	ch <- prometheus.MustNewConstMetric(c.keysEvictedDesc, prometheus.CounterValue, float64(metrics.KeysEvicted()))
	ch <- prometheus.MustNewConstMetric(c.costAddedDesc, prometheus.CounterValue, float64(metrics.CostAdded()))
	ch <- prometheus.MustNewConstMetric(c.costEvictedDesc, prometheus.CounterValue, float64(metrics.CostEvicted()))
	ch <- prometheus.MustNewConstMetric(c.getsDroppedDesc, prometheus.CounterValue, float64(metrics.GetsDropped()))
	ch <- prometheus.MustNewConstMetric(c.getsKeptDesc, prometheus.CounterValue, float64(metrics.GetsKept()))
	ch <- prometheus.MustNewConstMetric(c.ratioDesc, prometheus.CounterValue, float64(metrics.Ratio()))
	ch <- prometheus.MustNewConstMetric(c.lifeExpectancySecondsDesc, prometheus.CounterValue, float64(metrics.LifeExpectancySeconds().Count))
}

func main() {

	cache, _ := ristretto.NewCache(&ristretto.Config{
		NumCounters: 10000,
		MaxCost:     100000,
		BufferItems: 64,
		Metrics:     true,
	})

	collector := NewCacheStatsCollector(cache)
	prometheus.MustRegister(collector)

	http.Handle("/metrics", promhttp.Handler())
	http.Handle("/set", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		k := r.URL.Query().Get("key")
		v := r.URL.Query().Get("value")
		cache.Set(k, v, 1)
	}))
	http.Handle("/get", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		k := r.URL.Query().Get("key")
		if v, ok := cache.Get(k); ok {
			vs, _ := v.(string)
			w.Write([]byte(vs))
		}
	}))
	http.ListenAndServe(":2112", nil)
}

````

````shell
$ curl 'localhost:2112/set?key=foo&value=bar'

$ curl localhost:2112/metrics
# HELP ristretto_misses_total The number of misses in the cache.
# TYPE ristretto_misses_total counter
ristretto_misses_total{name="ristretto"} 1
# HELP ristretto_ratio The hit ratio of the cache.
# TYPE ristretto_ratio counter
ristretto_ratio{name="ristretto"} 0

$ curl 'localhost:2112/get?key=foo&value=bar'
bar

$ curl localhost:2112/metrics | rg 'ristretto'
# HELP ristretto_misses_total The number of misses in the cache.
# TYPE ristretto_misses_total counter
ristretto_misses_total{name="ristretto"} 1
# HELP ristretto_ratio The hit ratio of the cache.
# TYPE ristretto_ratio counter
ristretto_ratio{name="ristretto"} 0.5
````
