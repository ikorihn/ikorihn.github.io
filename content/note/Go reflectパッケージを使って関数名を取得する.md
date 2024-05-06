---
title: Go reflectパッケージを使って関数名を取得する
date: 2023-12-27T10:52:00+09:00
tags:
  - Go
---

[runtime.FuncForPC](https://pkg.go.dev/runtime#FuncForPC) を使う

```go
func FunctionName(i any) string {
	if reflect.TypeOf(i).Kind() == reflect.Func {
		return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
	}

	return ""
}
```
