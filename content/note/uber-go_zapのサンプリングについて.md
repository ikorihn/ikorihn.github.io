---
title: uber-go_zapのサンプリングについて
date: 2024-01-19T14:38:00+09:00
tags:
  - Go
---

[[Go]] の有名なロギングライブラリ [uber-go/zap](https://github.com/uber-go/zap) にて、短時間に同一のログを出力しようとしたときに期待よりも出力される量が少ないことがあった。
具体的には、Webサーバーでアクセスログを出力しているのだが、実際にアクセスされた量よりもログの量が少なかった。

## 再現

```go
package main

import (
	"go.uber.org/zap"
)

func main() {
	conf := zap.NewProductionConfig()
	conf.OutputPaths = []string{"stdout"}

	logger, _ := conf.Build()
	for i := 0; i < 150; i++ {
		logger.Info("test")
	}
}
```

```shell
❯ go run ./ | wc -l
100
```

## 理由

https://github.com/uber-go/zap/blob/master/FAQ.md#why-are-some-of-my-logs-missing に書いてある。
CPU使用量やI/O回数を減らしてパフォーマンスへの影響を減らすためにこうしている。

## サンプリングの設定値を変更する

`zap.NewProductionConfig()` で `SamplingConfig{Initial: 100, Thereafter: 100}` を渡している。

https://github.com/uber-go/zap/blob/d27427d23f81dba1f048d6034d5f286572049e1e/config.go#L157

ちなみに `zap.NewDevelopmentConfig()` ではこれが設定されていない気づくのが遅れた。

`zap.Config.Sampling` をnilにすると設定が無効になる。

```go
package main

import (
	"go.uber.org/zap"
)

func main() {
	conf := zap.NewProductionConfig()
	conf.OutputPaths = []string{"stdout"}
	conf.Sampling = nil

	logger, _ := conf.Build()
	for i := 0; i < 150; i++ {
		logger.Info("test")
	}
}
```

期待値通りの件数が出力される。

```shell
❯ go run ./ | wc -l
150
```

### 各設定値について

`Initial`, `Thereafter` の設定値はそれぞれ次のような意味になる

 - `Initial` 同一のログレベルとメッセージを持つ最初のN件のエントリは出力する
 - `Thereafter` その後の同一のログレベルとメッセージを持つエントリは、M件おきに出力し残りはドロップする

よって次のようにした場合、最初の50件 + 残りの50件は6件おきとなり合計58件出力される。
 
```go
func main() {
	conf := zap.NewProductionConfig()
	conf.OutputPaths = []string{"stdout"}
	conf.Sampling.Initial = 50
	conf.Sampling.Thereafter = 6
	conf.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder

	logger, _ := conf.Build()
	for i := 0; i < 100; i++ {
		logger.Info("test")
	}
}
```

```shell
❯ go run ./ | wc -l
58
```

### その他の設定

他にもサンプリング時に実行されるHookを登録したり、サンプリング間隔(デフォルトは1秒)を変更したりもできる。詳細は[godoc](https://pkg.go.dev/go.uber.org/zap@v1.26.0/zapcore#NewSamplerWithOptions)

## フィールドの変化は同一のログとみなされる

フィールドを可変にしても、メッセージが同じ場合はサンプリングされる

```go
func main() {
	conf := zap.NewProductionConfig()
	conf.OutputPaths = []string{"stdout"}
	conf.Sampling.Initial = 50
	conf.Sampling.Thereafter = 6
	conf.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder

	logger, _ := conf.Build()
	for i := 0; i < 100; i++ {
		logger.Info("test", zap.Int("count", i))
	}

}
```

=> 58件

## 1秒時間を空けるとリセットされる

```go
func main() {
	conf := zap.NewProductionConfig()
	conf.OutputPaths = []string{"stdout"}
	conf.Sampling.Initial = 50
	conf.Sampling.Thereafter = 6
	conf.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder

	logger, _ := conf.Build()
	for i := 0; i < 100; i++ {
		logger.Info("test", zap.Int("count", i))
	}

	time.Sleep(1 * time.Second)
	for i := 0; i < 100; i++ {
		logger.Info("test", zap.Int("count", i))
	}
}
```

=> 116件
