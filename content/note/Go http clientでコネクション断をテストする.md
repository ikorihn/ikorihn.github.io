---
title: Go http clientでコネクション断をテストする
date: 2023-12-21T17:02:00+09:00
tags:
- Go
---

リトライ処理のテストをしたかったのでやり方を調べた。

````go
res, err := client.Do(req)
if err != nil {
    // このときリトライするようにしているのをテストしたい
}
````

タイムアウトでもerrを返すため、clientのタイムアウトを極端に短くしてhttptest.Serverでちょっと待つようにすれば再現できるが、あまりスマートじゃない気がした。

## コネクションを切断する

[http.Hijacker](https://pkg.go.dev/net/http#Hijacker) interfaceを使うことでコネクションを乗っ取ることができる。

````go
import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/hashicorp/go-retryablehttp"
	"github.com/stretchr/testify/assert"
)

func TestRetry(t *testing.T) {
	t.Run("リトライしたときに成功する", func(t *testing.T) {
		var count int
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch count {
			case 0:
			    // 乗っ取り
				c, _, err := w.(http.Hijacker).Hijack()
				if err != nil {
					t.Fatal(err)
				}
			    // コネクションを断つ
				c.Close()
				count++
				return
			case 1:
				fmt.Fprintf(w, "successful response")
				return
			}
		}))
		defer ts.Close()

		retryClient := retryablehttp.NewClient()
		retryClient.Logger = nil
		retryClient.RetryMax = 2
		retryClient.RetryWaitMax = 1 * time.Second
		got, err := retryClient.Get(ts.URL)

		b, _ := io.ReadAll(got.Body)
		defer got.Body.Close()

		assert.NoError(t, err)
		assert.Equal(t, "successful response", string(b))
	})

}
````
