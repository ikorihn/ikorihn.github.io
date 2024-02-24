---
title: Go 複数のLambdaで共通で実行する処理をmiddlewareで書く
date: "2023-06-17T23:33:00+09:00"
tags:
  - '2023/06/13'
  - Go
  - Lambda
---

API Gateway向けの [[AWS Lambda]] のハンドラーをGoで作成する場合、普通に書くとこのように、main関数から特定のシグネチャの関数を lambda.Start で呼び出す。

https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/golang-handler.html

```go
package main

import (
        "fmt"
        "context"
        "github.com/aws/aws-lambda-go/events"
        "github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("Hello, %v", request.QueryStringParameters["name"]),
		StatusCode: 200,
	}, nil
}

func main() {
        lambda.Start(handler)
}
```

API GatewayのパスごとにFunctionを紐づけている場合に、ヘッダーからトレース用の情報を取得したり、ユーザー情報を取得したりといった各ハンドラー共通で実行する処理を書きたい。

API Gateway -----> /hello HelloFunction
      └------->  /bye ByeFunction

`hello/main.go`

```go
package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	traceId := request.Headers["X-Amzn-Trace-Id"]
	fmt.Println(traceId)

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("Hello, %v", request.QueryStringParameters["name"]),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
```

`bye/main.go`

```go
package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	traceId := request.Headers["X-Amzn-Trace-Id"]
	fmt.Println(traceId)

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("Bye, %v", request.QueryStringParameters["name"]),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
```

各ハンドラーのコードに同じ処理を書くのは、数が増えたときに間違えやすくなるので、なんとかしたい。

## http handlerのミドルウェア

net/httpでwebサーバーを作るときに、各http handlerに共通で実行したい処理を実装するパターンの一つとして、ミドルウェアを書くことがある。

参考 [HTTP Middleware の作り方と使い方 - 技術メモ](https://tutuz-tech.hatenablog.com/entry/2020/03/23/220326)

これは引数に `http.Handler` をとって `http.Handler` を返す関数で、ハンドラーの前後に処理を挟み込むのと、ミドルウェア自身をミドルウェアでラップすることができる。

```go
func logging(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Request: %v\n", r.URL.String())
    next.ServeHTTP(w, r)
  })
}
```

これをさらにwrapして、設定値を渡すような書き方もできる。echoのミドルウェアはこのような実装になっている。

```go
type HttpMiddlewareFunc func(next http.Handler) http.Handler

func LoggingMiddleware(debug bool) HttpMiddlewareFunc {
    return func (next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if debug {
                fmt.Printf("Request: %v\n", r.URL.String())
            }
            next.ServeHTTP(w, r)
        })
    }
}
```


## lambda handlerのミドルウェアに応用する

同様の方法でミドルウェアを書くとこんな感じになる。

```go
type LambdaHandlerFunc func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)
type LambdaMiddlewareFunc func(next LambdaHandlerFunc) LambdaHandlerFunc

func LoggingMiddleware(debug bool) HttpMiddlewareFunc {
    return func(next LambdaHandlerFunc) LambdaHandlerFunc {
        return LambdaHandlerFunc(func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
            if debug {
                fmt.Printf("Request: %v\n", request)
            }

            return next(ctx, request)
        })
    }
}
```

実用的な例としては以下のようになる。

```go
package middleware

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

type LambdaHandlerFunc func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)
type LambdaMiddlewareFunc func(next LambdaHandlerFunc) LambdaHandlerFunc

// ApplyMiddlewares
func ApplyMiddlewares(handler LambdaHandlerFunc) LambdaHandlerFunc {
	middlewares := []LambdaMiddlewareFunc{
		Header(),
		Auth(),
	}

	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}

	return handler
}

// Header contextにデフォルトのrequest/response headerをセットする
func Header() LambdaMiddlewareFunc {
	return func(next LambdaHandlerFunc) LambdaHandlerFunc {
		return func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

			resHeaders := http.Header{
				"Content-Type": []string{"application/json"},
			}
			ctx = SetResponseHeader(ctx, resHeaders)

			return next(ctx, request)
		}
	}
}

func Auth() LambdaMiddlewareFunc {
	return func(next LambdaHandlerFunc) LambdaHandlerFunc {
		return func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
			authHeader := request.Headers["Authorization"]
			// 認証処理

			ctx = SetUser(ctx, user)

			return next(ctx, request)
		}
	}
}

// ----
// ctxにセット/取得する処理
// ----

type ctxKey string

const (
	ctxKeyUser      ctxKey = "ctxKeyCustomerUser"
	ctxKeyResHeader ctxKey = "ctxKeyResHeader"
)

func SetResponseHeader(ctx context.Context, headers http.Header) context.Context {
	ctx = context.WithValue(ctx, ctxKeyResHeader, headers)
	return ctx
}

func ResponseHeaderFromContext(ctx context.Context) http.Header {
	if v, ok := ctx.Value(ctxKeyResHeader).(http.Header); ok {
		return v
	}
	return http.Header{}
}

func SetUser(ctx context.Context, user *User) context.Context {
	ctx = context.WithValue(ctx, ctxKeyUser, user)
	return ctx
}

func UserFromContext(ctx context.Context) *User {
	if v, ok := ctx.Value(ctxKeyUser).(*User); ok {
		return v
	}
	return nil
}

```

`hello/main.go`

```go
func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// ...Handlerの処理
}

func main() {
	lambda.Start(ApplyMiddlewares(handler))
}
```
