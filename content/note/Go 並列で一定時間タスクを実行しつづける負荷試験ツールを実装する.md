---
title: Go 並列で一定時間タスクを実行しつづける負荷試験ツールを実装する
date: 2023-12-19T11:10:00+09:00
tags:
  - Go
---
 

```go
package main

import (
	"context"
	"flag"
"fmt"
	"log"
	"log/slog"
	"math"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

var logger *slog.Logger

type Response struct {
	Body    []byte
	Header  http.Header
	Cookies []*http.Cookie
}

func main() {
	var baseUrl, logLevel string
	var duration time.Duration
	var workerCount int

	flag.StringVar(&baseUrl, "base-url", "", "")
	flag.DurationVar(&duration, "duration", 0, "e.g. 10s, 5m [0 = forever]")
	flag.IntVar(&workerCount, "workers", 1, "")
	flag.StringVar(&logLevel, "log-level", "INFO", "DEBUG/INFO/ERROR")
	flag.Parse()

	if baseUrl == "" {
		log.Fatalf("required option is missing: run with -h")
	}

	baseUrl = strings.TrimSuffix(baseUrl, "/")

	var loglevel slog.LevelVar
	switch strings.ToUpper(logLevel) {
	case "DEBUG":
		loglevel.Set(slog.LevelDebug)
	case "INFO":
		loglevel.Set(slog.LevelInfo)
	case "ERROR":
		loglevel.Set(slog.LevelError)
	}
	logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: &loglevel}))

	dt := http.DefaultTransport.(*http.Transport)
	tr := dt.Clone()
	tr.MaxIdleConnsPerHost = 20

	s := &MyTask{
		hc: &http.Client{
			Transport: tr,
		},
		baseUrl: baseUrl,
	}

	runner := Runner{}

	ctx := context.Background()

	ctx, stop := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if duration != 0 {
		ctxto, cancel := context.WithTimeout(ctx, duration)
		defer cancel()

		ctx = ctxto
	}

	errChan := make(chan error)
	if err := runner.Run(ctx, errChan, workerCount, s.Execute); err != nil {
		panic(err)
	}

	for {
		select {
		case <-ctx.Done():
			fmt.Println("Finish!!")
			return
		case err := <-errChan:
			if err != nil {
				fmt.Printf("error occured!! %v", err)
			}
		}
	}

}

type Task func() error

type Runner struct{}

func (r *Runner) Run(ctx context.Context, errChan chan<- error, workers int, tasks ...Task) error {
	totalTaskNum := len(tasks)

	for workerNum := 0; workerNum < workers; workerNum++ {
		workerNum := workerNum
		go func() {
			index := 0
			loopCount := 1
			delay := calculateExponentialBackoffWithJitter(workerNum, time.Second, 10*time.Second)
			time.Sleep(delay)

			for {
				select {
				case <-ctx.Done():
					return
				default:
					task := tasks[index]
					time.Sleep(delay)

					errChan <- r.safeRun(task)
					index++
					if index == totalTaskNum {
						loopCount++

						index = 0
					}
				}
			}
		}()
	}
	return nil
}

func (r *Runner) safeRun(task Task) (returnErr error) {
	defer func() {
		// don't panic
		if r := recover(); r != nil {
			err, ok := r.(error)
			if !ok {
				err = fmt.Errorf("%v", r)
			}

			returnErr = err
		}
	}()

	return task()
}

func calculateExponentialBackoffWithJitter(attempt int, baseDelay, maxDelay time.Duration) time.Duration {
	maxf := float64(maxDelay)
	basef := float64(baseDelay)

	durf := basef * math.Pow(2, float64(attempt))
	durf = rand.Float64()*(durf-basef) + basef

	if durf > maxf {
		durf = maxf
	}

	return time.Duration(durf)
}
```
