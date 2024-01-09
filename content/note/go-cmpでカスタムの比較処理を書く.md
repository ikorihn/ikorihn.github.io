---
title: go-cmpでカスタムの比較処理を書く
date: 2023-12-27T12:02:00+09:00
tags:
- Go
---

[go-cmp](note/go-cmp.md) にて、`cmp.Option` を実装することでカスタムの比較処理を書くことができる。

[cmpoptsパッケージ](https://github.com/google/go-cmp/blob/v0.6.0/cmp/cmpopts/ignore.go) に実装例があるのでこちらを真似るとよい。

https://pkg.go.dev/github.com/google/go-cmp/cmp#Option

一部を紹介する。

## Transformer

https://pkg.go.dev/github.com/google/go-cmp/cmp#Transformer

T型の値をR型に変換する。

例えば、float32のfieldをfloat64に変換するには以下のようにする

````go
cmp.Diff(x, y, 
    cmp.Transformer("f64", func(in float32) float64 {
        return float64(in)
    }),
 )
````

## FilterValues

https://pkg.go.dev/github.com/google/go-cmp/cmp#FilterValues

filter `func(T, T) bool` にマッチした場合にのみOptionを適用する。

````go
opts := cmp.Options{
	cmp.FilterValues(
		func(x, y float64) bool {
			return math.IsNaN(x) && math.IsNaN(y)
		},
		cmp.Comparer(func(_, _ any) bool { return true }),
	),
}
if diff := cmp.Diff(got, tt.want, opts...); diff != "" {
	t.Errorf("Value is mismatch (-got +want):\n%s", diff)
}
````

## 参考

[go-cmp の cmp.Diff() でJSON文字列を比較できるようにする - mrk21::blog {}](https://mrk21.hatenablog.com/entry/2022/12/14/222121)
