---
title: Go go-cmpでStructのfieldがfuncの場合に比較する
date: 2023-12-27T11:23:00+09:00
tags:
- Go
---

[testify](note/go_testifyを使う.md) でfieldにfunc型を含むstructを `assert.Equal` で比較すると、Diffにはなにも表れないがテストは失敗する。
https://github.com/stretchr/testify/issues/1146 によると、ライブラリの都合ではなく [Go](note/Go.md) の仕様としてfunc型の比較はお互いがnilかどうかしかチェックできず、それ以上の比較は行えないとなっている。

funcの名前だけでも比較できればとりあえず十分かなと思ったので、名前を比較する方法を調査する。

testifyでは難しそうなので、 [go-cmp](note/go-cmp.md) を使うことにする。

## 普通に比較すると失敗する

````go
import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

type Param struct {
	Condition func(x int) bool
}

func defaultCondition(x int) bool {
	return x > 5
}

func NewParam() *Param {
	return &Param{
		Condition: defaultCondition,
	}
}

func TestParam(t *testing.T) {
	got := NewParam()
	want := &Param{
		Condition: defaultCondition,
	}
	if diff := cmp.Diff(got, want); diff != "" {
		t.Errorf("Param is mismatch (-got +want):\n%s", diff)
	}
}
````

````shell
$ go test ./

=== RUN   TestParam
    param_test.go:29: Param is mismatch (-got +want):
          &httpclient.Param{
        -       Condition: ⟪0x01032d21c0⟫,
        +       Condition: ⟪0x01032d21c0⟫,
          }
--- FAIL: TestParam (0.00s)
FAIL
exit status 1
````

このように、ポインタのアドレスは同じで見た目的には差分はないのだが、diff ありとして失敗する。

`assert.Equal(t, want, got)` としても同じようになる。

````
Error:          Not equal:
                expected: &Param{Condition:(func(int) bool)(0x10091e1c0)}
                actual  : &Param{Condition:(func(int) bool)(0x10091e1c0)}
                Diff:
Test:           TestParam
````

## go-cmpのカスタムの比較処理を書く

[go-cmpでカスタムの比較処理](note/go-cmpでカスタムの比較処理を書く.md) を書いてあげれば良さそう。
[Go reflectパッケージを使って関数名を取得する](note/Go%20reflectパッケージを使って関数名を取得する.md) を応用して、以下のようにした。

````go
import (
	"reflect"
	"runtime"
	"testing"

	"github.com/google/go-cmp/cmp"
)

type Param struct {
	Name      string
	Body      *Body
	Condition func(x int) bool
	Hooks     []func(p *Param)
}

type Body struct {
	Comment string
}

func defaultCondition(x int) bool {
	return x > 5
}

func NewParam(name string, body *Body, hooks []func(p *Param)) *Param {
	return &Param{
		Name:      name,
		Body:      body,
		Condition: defaultCondition,
		Hooks:     hooks,
	}
}

func TestParam(t *testing.T) {
	hooks := []func(p *Param){func(p *Param) { p.Name = "MASKED" }}

	opts := []cmp.Option{
		cmp.FilterValues(
			func(x, y any) bool {
				if reflect.TypeOf(x).Kind() != reflect.TypeOf(y).Kind() {
					return false
				}
				if reflect.TypeOf(x).Kind() == reflect.Func {
					return true
				}
				if reflect.TypeOf(x).Kind() == reflect.Slice {
					xelem := reflect.ValueOf(x)
					yelem := reflect.ValueOf(y)
					if xelem.Len() > 0 && yelem.Len() > 0 {
						return reflect.TypeOf(xelem.Index(0)).Kind() == reflect.Func &&
							reflect.TypeOf(yelem.Index(0)).Kind() == reflect.Func
					}
				}
				return false
			},
			cmp.Transformer("FuncName", func(i any) string {
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
			}),
		),
	}

	got := NewParam("the name", &Body{Comment: "foo"}, hooks)
	want := &Param{
		Name: "the name",
		Body: &Body{
			Comment: "foo",
		},
		Condition: defaultCondition,
		Hooks:     hooks,
	}
	if diff := cmp.Diff(got, want, opts...); diff != "" {
		t.Errorf("Param is mismatch (-got +want):\n%s", diff)
	}
}
````

**これで go test を実行するとテストが通るようになった**

````shell
$ go test ./
=== RUN   TestParam
--- PASS: TestParam (0.00s)
PASS
ok
````

## 改良

もう少し調べたら、sliceの中身はgo-cmpの方で展開してくれるので、`Kind() == reflect.Func` の場合のみTransformを行っても問題なかった。

````go
import (
	"reflect"
	"runtime"
	"testing"

	"github.com/google/go-cmp/cmp"
)

type Param struct {
	Name      string
	Body      *Body
	Condition func(x int) bool
	Hooks     []func(p *Param)
}

type Body struct {
	Comment string
}

func defaultCondition(x int) bool {
	return x > 5
}

func NewParam(name string, body *Body, hooks []func(p *Param)) *Param {
	return &Param{
		Name:      name,
		Body:      body,
		Condition: defaultCondition,
		Hooks:     hooks,
	}
}

func TestParam(t *testing.T) {
	hooks := []func(p *Param){
		func(p *Param) { p.Name = "MASKED" },
		func(p *Param) { p.Body.Comment = "MASKED" },
	}

	opts := []cmp.Option{
		cmp.FilterValues(
			func(x, y any) bool {
				return reflect.TypeOf(x).Kind() == reflect.TypeOf(y).Kind() && reflect.TypeOf(x).Kind() == reflect.Func
			},
			cmp.Transformer("FuncName", func(i any) string {
				return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
			}),
		),
	}

	got := NewParam("the name", &Body{Comment: "foo"}, hooks)
	want := &Param{
		Name: "the name",
		Body: &Body{
			Comment: "foo",
		},
		Condition: defaultCondition,
		Hooks:     hooks,
	}
	if diff := cmp.Diff(got, want, opts...); diff != "" {
		t.Errorf("Param is mismatch (-got +want):\n%s", diff)
	}
}
````

一応、ちゃんと `FuncName` が実行されているか確認したところちゃんと通っていた。

````go
// ....
			cmp.Transformer("FuncName", func(i any) string {
				funcName := runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
				fmt.Printf("funcName=%s\n", funcName)
				return funcName
			}),
// ....
````

````shell
❯ go test -v -run TestParam$

=== RUN   TestParam
funcName=defaultCondition
funcName=defaultCondition
funcName=TestParam.func2
funcName=TestParam.func2
funcName=TestParam.func1
funcName=TestParam.func1
funcName=TestParam.func1
funcName=TestParam.func1
funcName=TestParam.func1
funcName=TestParam.func2
funcName=TestParam.func2
--- PASS: TestParam (0.00s)
PASS
````
