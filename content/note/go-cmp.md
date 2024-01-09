---
title: go-cmp
date: 2023-12-27T11:45:00+09:00
tags:
- Go
---

{{< card-link "https://github.com/google/go-cmp" >}}

[Go](note/Go.md) のテストで構造体を比較するとき、標準では `reflect.DeepEqual` を使って判定するが、これはdiffが見づらかったり、比較したくないフィールドがあるときに制御がしづらかったりといった不満がある。

そこで役立つのが `go-cmp` で、

* diffを見やすくする
* 比較したいフィールドを柔軟に制御できる
  といった点で `reflect.DeepEqual` よりも使いやすい。

Goのテスティングライブラリとして [testify](note/go_testifyを使う.md)  もあるが、こちらはライブラリ自体が大きかったり、Go標準の書き方からは乖離してしまうというところで利用したくない場合もある。

`go-cmp` は以下のようにシンプルに書くことができる。

````go
if diff := cmp.Diff(got, tt.want, opts...); diff != "" {
    t.Errorf("Values are mismatch (-got +want):\n%s", diff)
}
````
