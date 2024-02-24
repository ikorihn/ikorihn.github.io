---
title: Go 呼び出し元の関数名を含めてログ出力する
date: "2023-08-07T18:03:00+09:00"
tags:
  - '2023/08/07'
  - Go
lastmod: '2023-08-07T18:03:58+09:00'
---

複数箇所にデバッグ用のログを仕込むにあたって、呼び出し元を勝手に挿入してくれると助かるので方法を調べた。

https://stackoverflow.com/questions/25927660/how-to-get-the-current-function-name

`runtime.CallersFrames` を使って呼び出し元を特定できる。
具体的には以下のようにする。

```go
func trace(msg string) {
	pc := make([]uintptr, 15)
	n := runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc[:n])
	frame, _ := frames.Next()
	fmt.Printf("[%s:%d %s] %s\n", frame.File, frame.Line, frame.Function, msg)
}
```
