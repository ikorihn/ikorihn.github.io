---
title: Go 関数呼び出し元の情報を出力する
date: 2023-09-11T09:04:00+09:00
tags:
- Go
---

コールスタックの情報をデバッグログに埋め込みたかったので方法を調べた。
[logrus](https://github.com/sirupsen/logrus) を使っているがロガーはなんでも良い。

[Go](note/Go.md)では `runtime/debug.Stack()` や `runtime.Callers` + `runtime.CallersFrames` といったruntimeパッケージの関数でコールスタックを取得できる。

`runtime.Callers` はコールスタック内のフレームのプログラムカウンタを返し、`runtime.CallersFrames` でフレームの情報を取得できる

````go
import (
	"fmt"
	"runtime"

	"github.com/sirupsen/logrus"
)

func Trace(logCtx *logrus.Entry, message string) {
	// 呼び出し元のコールスタックを取得
	pc := make([]uintptr, 15)
	n := runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc[:n])
	frame, _ := frames.Next()

	myLogCtx := logCtx.WithField("Caller", fmt.Sprintf("%s:%d(%s)", frame.File, frame.Line, frame.Function))
	myLogCtx.Infof(message)
}
````

## log/slogの場合

Go 1.21で入ったslogでは、生成時のオプションで `AddSource: true` を指定することで呼び出し元を出力できる。

* コールスタック取得 https://github.com/golang/go/blob/5eb382fc08fb32592e9585f9cb99005696a38b49/src/log/slog/logger.go#L214
* 出力 https://github.com/golang/go/blob/5eb382fc08fb32592e9585f9cb99005696a38b49/src/log/slog/handler.go#L290

````go
package main

import (
	"log/slog"
	"os"
)

func main() {
	lg := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     slog.LevelDebug,
		AddSource: true,
	}))
	run(lg)
}

func run(lg *slog.Logger) {
	lg.Debug("debug")
	lg.Info("info")
}

// =>
// {"time":"2023-09-11T09:23:44.008573+09:00","level":"DEBUG","source":{"function":"main.run","file":"/Users/hiroki-nagayama/work/go-playground/slog/main.go","line":17},"msg":"debug"}
// {"time":"2023-09-11T09:23:44.00901+09:00","level":"INFO","source":{"function":"main.run","file":"/Users/hiroki-nagayama/work/go-playground/slog/main.go","line":18},"msg":"info"}
````
