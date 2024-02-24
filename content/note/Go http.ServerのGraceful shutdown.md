---
title: Go http.ServerのGraceful shutdown
date: "2022-12-18T13:42:00+09:00"
tags:
  - 'Go'
lastmod: "2022-12-18T13:42:00+09:00"
---

#Go


Go 1.8 からはhttp.ServerにGraceful Shutdownを行うための仕組みが備わっている
context.Contextを渡すことで猶予時間を決めてリクエスト中の処理の終了を待つことができる

```go
package main

import (
	"context"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	h := echo.New()
	h.GET("/ping", func(c echo.Context) error {
		resp := map[string]string{
			"msg": "ok",
		}
		return c.JSON(http.StatusOK, resp)
	})

	srv := http.Server{
		Addr:    ":1323",
		Handler: h,
	}

	// Graceful shutdown のため、interrupt signalをキャッチして即時終了しないようにする
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to listen and serve: %v\n", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Println("Shutting down gracefully, press Ctrl+C again to force")

    // 処理中のリクエストがある場合に猶予10秒を持たせてからshutdownする
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server exiting")
}
```

`signal.NotifyContext` ではなく `signal.Notify` を使う例も見かけるがラップしているだけなのでだいたい同じ

```go
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	<-quit

```
