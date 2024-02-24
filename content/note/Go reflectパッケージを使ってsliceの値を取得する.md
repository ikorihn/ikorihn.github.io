---
title: Go reflectパッケージを使ってsliceの値を取得する
date: 2023-12-27T10:54:00+09:00
tags:
  - Go
lastmod: '2023-12-27T10:54:36+09:00'
---

```go
func SliceValue(i any) any {
	if reflect.TypeOf(i).Kind() == reflect.Slice {
		sliceVal := reflect.ValueOf(i)
		if sliceVal.Len() > 0 {
			return sliceVal.Index(0).Interface()
		}
	}

	return nil
}
```

[[Go reflectパッケージを使って関数名を取得する]] と組み合わせると、こういうこともできる

```go
func FunctionName(i any) string {
	if reflect.TypeOf(i).Kind() == reflect.Func {
		return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
	} else if reflect.TypeOf(i).Kind() == reflect.Slice {
		sliceVal := reflect.ValueOf(i)
		if sliceVal.Len() > 0 {
			firstElem := sliceVal.Index(0)
			return runtime.FuncForPC(firstElem.Pointer()).Name()
		}
	}

	return ""
}
```
