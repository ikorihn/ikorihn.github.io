---
title: Go reflectパッケージを使ってfuncを実行する
date: 2024-07-23T15:21:00+09:00
tags:
  - Go
---

`reflect.Value.Call` を使う

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {

	fn := func(a, b string) {
		fmt.Println(a, b)
	}

	callback := reflect.ValueOf(fn)

	args := make([]reflect.Value, 3)
	args[0] = reflect.ValueOf("foo")
	args[1] = reflect.ValueOf("bar")

	callback.Call(args)
	// => foo bar
}
```

引数の個数が一致していないとpanicになる

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {

	fn := func(a, b string) {
		fmt.Println(a, b)
	}

	callback := reflect.ValueOf(fn)

	args := make([]reflect.Value, 3)
	args[0] = reflect.ValueOf("foo")
	args[1] = reflect.ValueOf("bar")
	args[2] = reflect.ValueOf("baz")

	callback.Call(args)
	// => panic: reflect: Call with too many input arguments
	// 少ない場合 panic: reflect: Call with too few input arguments
}
```

いいやり方かわからないが、個数が一致するように以下のようにしてみた。

- `reflect.Value.Type().NumIn()` でfuncの引数の個数がわかる
- `reflect.New(funcType.In(i)).Elem()` でi番目の引数の型のゼロ値を取得する

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {

	fn := func(a, b string) {
		fmt.Println(a, b)
	}

	callback := reflect.ValueOf(fn)

	args := make([]any, 0)
	args = append(args, "foo")
	args = append(args, "bar")
	args = append(args, "baz")

	funcType := callback.Type()
	inputLen := funcType.NumIn()
	fmt.Printf("input length for func=%d\n", inputLen)

	passedArguments := make([]reflect.Value, inputLen)
	for i := range len(passedArguments) {
		var v any
		if len(args) > i {
			v = args[i]
		}
		if v == nil {
			passedArguments[i] = reflect.New(funcType.In(i)).Elem()
		} else {
			passedArguments[i] = reflect.ValueOf(v)
		}
	}
	callback.Call(passedArguments)
}
```


[[Go reflectパッケージを使って関数名を取得する]]
[[Go reflectパッケージを使ってsliceの値を取得する]]