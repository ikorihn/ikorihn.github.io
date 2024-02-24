---
title: zap.Loggerでログ出力時にSentryにも出力する
date: "2021-09-30T21:15:00+09:00"
tags:
  - 'Go'
---

<https://docs.sentry.io/platforms/go/>

zap初期化時に、Hookを登録することができる。
zapcore.Entryを引数に取るので、そこからメッセージやログレベルを取得してやればよい

```go
import (
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/getsentry/sentry-go"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func NewLogger(levelStr string) (*zap.Logger, error) {
	level := parseLogLevel(levelStr)
	config := zap.Config{
		Level: zap.NewAtomicLevelAt(level),
	}

	// 環境変数SENTRY_DSNを設定するか、ClientOptionsに設定する
	err := sentry.Init(sentry.ClientOptions{})
	if err != nil {
		fmt.Printf("sentry.Init: %s", err)
	}

	return config.Build(zap.Hooks(func(entry zapcore.Entry) error {
		if entry.Level == zapcore.ErrorLevel {
			defer sentry.Flush(2 * time.Second)
			ev := sentry.NewEvent()
			ev.Level = sentry.LevelError
			ev.Message = entry.Message
			sentry.CaptureEvent(ev)
		}
		return nil
	}))
}

func parseLogLevel(levelStr string) zapcore.Level {
	switch strings.ToUpper(levelStr) {
	case zapcore.DebugLevel.CapitalString():
		return zapcore.DebugLevel
	case zapcore.InfoLevel.CapitalString():
		return zapcore.InfoLevel
	case zapcore.WarnLevel.CapitalString():
		return zapcore.WarnLevel
	case zapcore.ErrorLevel.CapitalString():
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}

```

[logging - How to use Sentry with go.uber.org/zap/zapcore logger - Stack Overflow](https://stackoverflow.com/questions/64801270/how-to-use-sentry-with-go-uber-org-zap-zapcore-logger)
[[Go]Sentryに対応したcustom errorの作り方](https://zenn.dev/tomtwinkle/articles/18447cca3232d07c9f12)
