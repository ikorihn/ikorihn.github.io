---
title: Go webサーバーをホットリロードする
date: 2024-07-10T17:36:00+09:00
tags:
  - Go
---

Webアプリケーションの開発時は、hot reload(live reload) があるとソースコードを変更したら勝手に反映してくれて便利です。
[[Go]] で有名なところだと https://github.com/air-verse/air や https://github.com/go-task/task などがあります。

これらのツールを使うと簡単にホットリロードが実現できるのですが、サーバーの終了に失敗してportが使用中のままになってしまい再起動に失敗することがちょくちょく発生していたため、確実にサーバーを停止してから起動するよう対策しました。

ちなみにサーバーは [[Go http.ServerのGraceful shutdown|Graceful shutdown]] しています。

## PIDを記録する

サーバー起動時に、プロセスIDをファイルに記録するようにします。
`<executable> --pid-file=<filename>` とすることでオプションで指定したファイルに出力されます。

```go
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// ホットリロード時などにプロセスをkillするために出力する
	var pidFile string
	flag.StringVar(&pidFile, "pid-file", "", "Path to pid file")
	flag.Parse()
	if len(pidFile) > 0 {
		if err := os.WriteFile(pidFile, []byte(fmt.Sprintf("%d", os.Getpid())), 0664); err != nil {
			log.Printf("[WARNING] Failed to write pid file. %v\n", err)
		}
		defer func() {
			_ = os.Remove(pidFile)
		}()
	}

	http.HandleFunc("GET /ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	srv := http.Server{
		Addr: ":3000",
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Failed to listen and serve: %v\n", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Println("Shutting down gracefully, press Ctrl+C again to force")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server exiting")
}
```

## ホットリロードの設定

ここではgo-taskを使います。

Taskfile.ymlを次のようにします。

```yaml
version: 3

vars:
  PID_FILE: ".pid"

tasks:
  build:
    cmds:
      - go build -ldflags '-s -w' -trimpath -o ./bin/webapp ./cmd/

  start:
    cmds:
      - ./bin/webapp --pid-file={{.PID_FILE}}

  hotreload:
    sources:
      - "**/*.go"
    cmds:
      - cmd: "[[ -e {{.PID_FILE}} ]] && kill -TERM $(cat {{.PID_FILE}})"
        ignore_error: true
      - task build
      - task start
```

`task -w` でファイル監視を有効にして実行します。

```shell
task -w hotreload
```

これで `sources` に指定されたファイルを変更すると、サーバーを確実に停止してから自動で再ビルド、再起動されるようになりました。
