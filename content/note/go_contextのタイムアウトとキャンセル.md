---
title: go_contextのタイムアウトとキャンセル
date: "2021-07-06T21:24:00+09:00"
tags: 
---

#Go 


[Goのcontextによるキャンセルやタイムアウト - oinume journal](https://journal.lampetty.net/entry/cancel-and-timeout-with-context-in-go)
[context.WithCancel, WithTimeout で知っておいた方が良いこと - Carpe Diem](https://christina04.hatenablog.com/entry/tips-for-context-with-cancel_1)

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := printHello(ctx); err != nil {
			fmt.Printf("cannot print greeting: %v\n", err)
			return
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := printGoodbye(ctx); err != nil {
			fmt.Printf("cannot print goodbye: %v\n", err)
			return
		}
	}()

	wg.Wait()
}

func printHello(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()

	switch _, err := communicate(ctx); {
	case err != nil:
		return err
	}
	fmt.Printf("%s world!\n", "hello")
	return nil
}

func printGoodbye(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	switch _, err := communicate(ctx); {
	case err != nil:
		return err
	}
	fmt.Printf("%s world!\n", "goodbye")
	return nil
}

func communicate(ctx context.Context) (string, error) {
    // n秒後に処理を継続
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-time.After(5 * time.Second):
		//fmt.Printf("1 second elapsed\n")
	}
	return "handshake", nil
}
```

- `communicate` を5秒(タイムアウト値より長い)にする → タイムアウトして `cannot print greeting: deadline exceeded`
- `communicate` を3秒(helloのタイムアウト値より短い、goodbyeのタイムアウト値より長い)にする → helloは完了するがgoodbyeはタイムアウトする
- `communicate` を1秒(タイムアウト値より短い)にする → 両方完了する

## 親のcontextをキャンセルすると、子のcontextもキャンセルされる

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := printHello(ctx); err != nil {
			fmt.Printf("cannot print greeting: %v\n", err)
            cancel()
			return
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := printGoodbye(ctx); err != nil {
			fmt.Printf("cannot print goodbye: %v\n", err)
			return
		}
	}()

	wg.Wait()
}

func printHello(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	switch _, err := communicate(ctx); {
	case err != nil:
		return err
	}
	fmt.Printf("%s world!\n", "hello")
	return nil
}

func printGoodbye(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()

	switch _, err := communicate(ctx); {
	case err != nil:
		return err
	}
	fmt.Printf("%s world!\n", "goodbye")
	return nil
}

func communicate(ctx context.Context) (string, error) {
    // n秒後に処理を継続
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-time.After(5 * time.Second):
		//fmt.Printf("1 second elapsed\n")
	}
	return "handshake", nil
}
```

=> printHelloがタイムアウト → 親の `cancel()` を実行 → 子の `ctx.Done()` が実行されてprintGoodbyeも終了する

```
cannot print greeting: context deadline exceeded
cannot print goodbye: context canceled
```
