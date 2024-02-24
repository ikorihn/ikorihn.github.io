---
title: Lambdaでタイムアウトしたときに処理をしたい
date: "2021-12-09T18:14:00+09:00"
tags:
  - 'Go'
  - 'Lambda'
lastmod: '2021-12-09T18:14:25+09:00'

---

#Go #Lambda

[Go の AWS Lambda context オブジェクト - AWS Lambda](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/golang-context.html)

Lambda では実行時に context.Context を受け取ることができ、
Lambda が起動した時間＋Lambdaのタイムアウト秒を DeadLine として取得することができる。

```go
package main

import (
        "context"
        "log"
        "time"
        "github.com/aws/aws-lambda-go/lambda"
)

func longFunc(ctx, err chan error) {
    time.Sleep(2 * time.Second)
    close(err)
}

func LongRunningHandler(ctx context.Context) (string, error) {

	deadline, _ := ctx.Deadline()
	deadline = deadline.Add(-1 * time.Second)
	timeoutChannel := time.After(time.Until(deadline))

	errChan := make(chan error)

	go longFunc(ctx, errChan)

	select {
	case <-timeoutChannel:
		return nil, errors.New("timeout")
	case err := <-errChan:
        if err != nil {
            return nil, err
        } else {
            return "success", nil
        }
	}

}

func main() {
        lambda.Start(LongRunningHandler)
}
```
