---
title: Go Sentryに送信する
date: 2022-12-27T10:12:00+09:00
lastmod: 2022-12-27T10:12:00+09:00
tags:
- Go
---

\#Go

GoのコードでSentryにメッセージを送信するやり方

## 普通のGoのコード

GoでSentryにエラーを送信する場合、 <https://github.com/getsentry/sentry-go> を使う。
以前はraven-goという名前だったので、古いページではこちらで記載されているかも。

Webフレームワーク等を使わないプレーンなGoのコードの場合、 `github.com/getsentry/sentry-go` をimportして呼び出せばよい

[Go | Sentry Documentation](https://docs.sentry.io/platforms/go/)

````go
package main

import (
	"log"
	"time"

	"github.com/getsentry/sentry-go"
)

func main() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
		// Enable printing of SDK debug messages.
		// Useful when getting started or trying to figure something out.
		Debug: true,
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
	// Flush buffered events before the program terminates.
	// Set the timeout to the maximum duration the program can afford to wait.
	defer sentry.Flush(2 * time.Second)

    sentry.CaptureMessage("It works!")
}
````

### Scope, Hub

[Scopes and Hubs for Go | Sentry Documentation](https://docs.sentry.io/platforms/go/enriching-events/scopes/)

イベントがキャプチャされてSentryに送信されるとき、SDKで現在のスコープ内でイベントデータに追加情報を付与する

`init()` が呼ばれるとhubが作成されて、その上に空のscopeとクライアントが作成される。
scope は、Sentryにイベント送信時に `context` と `breadcrumbs` といった情報を追加して送信する。
親scopeから継承したデータを送信する。

### Stacktraceを表示したい

[\[Go\]Sentryに対応したcustom errorの作り方](https://zenn.dev/tomtwinkle/articles/18447cca3232d07c9f12)

## httpサーバーにSentryを組み込む

[net/http | Sentry Documentation](https://docs.sentry.io/platforms/go/guides/http/)
[Echo | Sentry Documentation](https://docs.sentry.io/platforms/go/guides/echo/)
[Gin | Sentry Documentation](https://docs.sentry.io/platforms/go/guides/gin/)

各フレームワーク用にライブラリが用意されている。
middlewareに設定することで、handlerでpanic発生時にイベントを送信できる。

`net/http` の例

````go
import (
	"fmt"
	"net/http"

	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
)

type handler struct{}

func (h *handler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	if hub := sentry.GetHubFromContext(r.Context()); hub != nil {
		hub.WithScope(func(scope *sentry.Scope) {
			scope.SetExtra("unwantedQuery", "someQueryDataMaybe")
			hub.CaptureMessage("User provided unwanted query string, but we recovered just fine")
		})
	}
	rw.WriteHeader(http.StatusOK)
}

func enhanceSentryEvent(handler http.HandlerFunc) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		if hub := sentry.GetHubFromContext(r.Context()); hub != nil {
			hub.Scope().SetTag("someRandomTag", "maybeYouNeedIt")
		}
		handler(rw, r)
	}
}

func main() {

    // To initialize Sentry's handler, you need to initialize Sentry itself beforehand
    if err := sentry.Init(sentry.ClientOptions{
    	Dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
    	EnableTracing: true,
    	// Set TracesSampleRate to 1.0 to capture 100%
    	// of transactions for performance monitoring.
    	// We recommend adjusting this value in production,
    	TracesSampleRate: 1.0,
    }); err != nil {
    	fmt.Printf("Sentry initialization failed: %v\n", err)
    }
    
    sentryHandler := sentryhttp.New(sentryhttp.Options{
    	Repanic: true, // Sentryに送信したあと再度panicを発生させて上位階層でキャッチできるようにする
    })
    
    http.Handle("/", sentryHandler.Handle(&handler{}))
    http.HandleFunc("/foo", sentryHandler.HandleFunc(
    	enhanceSentryEvent(func(rw http.ResponseWriter, r *http.Request) {
    		panic("y tho")
    	}),
    ))
    
    fmt.Println("Listening and serving HTTP on :3000")
    
    if err := http.ListenAndServe(":3000", nil); err != nil {
    	panic(err)
    }
}
````

middlewareで `sentry.GetHubFromContext(r.Context())` を呼ぶことで、リクエストスコープでhubの設定をして他のリクエストと混ざらないようになっている。

`sentryhttp.New` の中では次のような処理をしている

````go
func (h *Handler) handle(handler http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		hub := sentry.GetHubFromContext(ctx)
		if hub == nil {
			hub = sentry.CurrentHub().Clone()
			ctx = sentry.SetHubOnContext(ctx, hub)
		}
		options := []sentry.SpanOption{
			sentry.OpName("http.server"),
			sentry.ContinueFromRequest(r),
			sentry.TransctionSource(sentry.SourceURL),
		}
		// We don't mind getting an existing transaction back so we don't need to
		// check if it is.
		transaction := sentry.StartTransaction(ctx,
			fmt.Sprintf("%s %s", r.Method, r.URL.Path),
			options...,
		)
		defer transaction.Finish()
		// TODO(tracing): if the next handler.ServeHTTP panics, store
		// information on the transaction accordingly (status, tag,
		// level?, ...).
		r = r.WithContext(transaction.Context())
		hub.Scope().SetRequest(r)
		defer h.recoverWithSentry(hub, r)
		// TODO(tracing): use custom response writer to intercept
		// response. Use HTTP status to add tag to transaction; set span
		// status.
		handler.ServeHTTP(w, r)
	}
}
````

* http.RequestのContextからhubを取得
  * なければ生成してContextにセット
* scopeにhttp.RequestをSetRequest
* handlerでpanicが発生したときにrecoverする
  * `Repanic: true` なら再度panicを発生させる

### 停止時の処理

[Shutdown and Draining for Echo | Sentry Documentation](https://docs.sentry.io/platforms/go/guides/echo/configuration/draining/)

サーバー停止時に `sentry.Flush` を呼んで、送信途中のイベントがあったら送信されるようにする。

## http.Request.HeaderをSentryに送信する

`0.15.0` で入った変更でデフォルトではheaderが送信されないようになった。
[https://github.com/getsentry/sentry-go/pull/485](https://github.com/getsentry/sentry-go/pull/485)
Hostのみが送信される。

`sentry.Init` 時に `SendDefaultPII: true` をつけることで、headerも送信されるようになる。

````
	if err := sentry.Init(sentry.ClientOptions{
		Dsn:            conf.Sentry.Dsn,
		SendDefaultPII: true,
	}); err != nil {
		log.Fatalf("Sentry initialization failed: %v\n", err)
	}
````

`0.16.0` で、プライベートな情報以外のヘッダーは送信されるよう修正した(変更者:私)
