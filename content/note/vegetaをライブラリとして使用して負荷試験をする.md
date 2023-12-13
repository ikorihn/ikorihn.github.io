---
title: vegetaをライブラリとして使用して負荷試験をする
date: 2023-10-31T17:26:00+09:00
tags:
- Go
- loadtest
---

[Vegeta](note/Vegeta.md) をライブラリとして利用することで、Goで負荷試験シナリオを柔軟に作ることもできる。

## 公式ドキュメント

[https://github.com/tsenart/vegeta#usage-library](https://github.com/tsenart/vegeta#usage-library)

## サンプル

````go
package main

import (
	"fmt"[]()
	"net/http"
	"sync/atomic"
	"time"

	vegeta "github.com/tsenart/vegeta/v12/lib"
)

func main() {
    // 負荷試験パラメータ(例: 1秒間に5リクエストを100秒間実行する)
	rate := vegeta.Rate{Freq: 5, Per: time.Second}
	duration := 100 * time.Second

	targets := make([]vegeta.Target, 0)

	// リクエストを作る
	targets = append(targets, vegeta.Target{
		Method: "GET",
		URL:    "https://example.com/get",
	})
	targets = append(targets, vegeta.Target{
		Method: "POST",
		URL:    "https://example.com/post",
		Body:   []byte(`{"name": "Corey", "animal": "dog"}`),
		Header: http.Header{
			"Content-Type": []string{"application/json"},
		},
	})

	targeter := vegeta.NewStaticTargeter(targets...)
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Big Bang!") {
		metrics.Add(res)
	}
	metrics.Close()

	fmt.Printf("result: %+v\n", metrics)
}
````

## 複雑な例

負荷リクエストのパラメータを可変にしたい場合次のように書ける。

````go
package main

import (
	"fmt"
	"net/url"
	"sync/atomic"
	"time"

	vegeta "github.com/tsenart/vegeta/v12/lib"
)

func main() {

	// 負荷試験パラメータ(例: 1秒間に5リクエストを100秒間実行する)
	rate := vegeta.Rate{Freq: 5, Per: time.Second}
	duration := 100 * time.Second

	targets := make([]vegeta.Target, 0)

	// リクエストを作る
	targets = append(targets, vegeta.Target{
		Method: "GET",
		URL:    "https://example.com/get?id=00000000",
	})

	// 自作したTargeterを利用する
	targeter := NewCustomTargeter(targets...)
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Big Bang!") {
		metrics.Add(res)
	}
	metrics.Close()

	fmt.Printf("result: %+v\n", metrics)
}

// NewCustomTargeter targetを作る処理を自作する
func NewCustomTargeter(tgts ...vegeta.Target) vegeta.Targeter {
	i := int64(-1)

	loopCount := 0

	return func(tgt *vegeta.Target) error {
		if tgt == nil {
			return vegeta.ErrNilTarget
		}

		addedIndex := atomic.AddInt64(&i, 1)
		*tgt = tgts[addedIndex%int64(len(tgts))]
		// 1周したらloopCountを増やす
		if addedIndex%int64(len(tgts)) == 0 {
			loopCount++
		}

		u, _ := url.Parse(tgt.URL)
		q := u.Query()
		q.Set("id", fmt.Sprintf("%08d", loopCount))
		u.RawQuery = q.Encode()

		tgt.URL = u.String()

		return nil
	}
}
````
