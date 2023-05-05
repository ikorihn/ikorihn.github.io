---
title: go_testifyを使う
date: 2021-07-14T19:07:00+09:00
lastmod: 2021-07-14T21:12:32+09:00
---

\#Go

## testify

<https://github.com/stretchr/testify>

assert, mock, suiteなど、テストに便利な機能を提供するライブラリ

Goには標準で `testing` ライブラリが備わっていて、標準で十分な場面もあるが、
ある程度大きなプロジェクトになってくるとやはり物足りなくなってくる

## assert

ライブラリをimportする

````go
import (
    "testing"
    "github.com/stretchr/testify/assert"
)
````

`assert.<アサーション関数>(testing.T, 期待値, 実際の値)`

````go
func TestSomething(t *testing.T) {
  assert.Equal(t, 123, 123, "等しい")
  assert.NotEqual(t, 123, 456, "等しくない")
  var obj *object = nil
  assert.Nil(t, obj)
  
  obj = &object{
    Value: "Something",
  }
  if assert.NotNil(t, obj) {
    assert.Equal(t, "Something", obj.Value)
  }
  
  actualObj, err := SomeFunction()
  // errors.Is を使った比較
  assert.ErrorIs(t, expectedError, err)

}
````

## mock

通信やDBをmockする機能が用意されている。

### テスト対象

例として以下のインターフェースをmockする

````go
type ItemRepository interface {
    Get(id int) (string, error)
}
````

````go
type Item struct {
    repo ItemRepository
}

func (i *Item) Name(id int) (string, error) {
    name, err := i.repo.Get(id)
    if name == nil || err != nil {
        return "", err
    }
    return name, nil
}
````

### モック作成

* メソッド内でCalledメソッドを実行し、retを取得
* ret.Get(戻り値のindex)をメソッドの戻り値とする
  * 戻り値がエラーの場合はret.Error(戻り値のindex)

````go
import mock "github.com/stretchr/testify/mock"

// mock.Mockを埋め込む
type MockItemRepository struct {
    mock.Mock
}

// インターフェースを実装
func (_m *MockUserInterface) Get(id int) (string, error) {
    ret := _m.Called(id)
    return ret.Get(0).(string), ret.Error(1)
}

````

mockを毎回手で書くのは大変なので、mockeryを使うと便利 [go_mockery](note/go_mockery.md)

### テスト実行

1. モックの期待引数、戻り値を設定
1. テスト対象にモックを注入
1. テスト実行(内部でモック実行)
1. mockの実行回数をassert

````go
func TestItem(t *testing.T) {
    expected := "みかん"

    // モック
    mockRepo := new(MockItemRepository)
    // モックの戻り値を設定
    mockRepo.
        On("Get", 1).
        Return(expected, nil)

    // テスト対象(モックを注入)
    i := &Item{
        repo: mockRepo,
    }
    // テスト実行(内部でモック実行されて記録される)
    got, err := i.Name(1)
    assert.Error(t, err)
    
    // 少なくとも一回呼び出されたことを確認する
    mockRepo.AssertExpectations(suite.T())
    // 回数をassertしたい場合
    mockRepo.AssertNumberOfCalls(suite.T(), "Get", 1)
    // 一回も呼び出されていないことを確認する場合
    // mockRepo.AssertNotCalled(suite.T(), "Get", 1)
}
````

## suite

各test前後に

````go
package main

import (
    "os"
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
)

type MyTestSuiteStruct struct {
    suite.Suite
}

// 各testの前に実行される
func (suite *MyTestSuiteStruct) SetupTest() {
    os.Setenv("HELLO", "WORLD")
}

// 各testの後に実行される
func (suite *MyTestSuiteStruct) TearDownTest() {
	os.Clearenv()
}

// 各テストは "Test" で始まる必要がある
func (suite *MyTestSuiteStruct) TestHello() {
    // *testing.T の代わりに suite.T() を使う
    assert.Equal(suite.T(), 1, 1)
    assert.Equal(suite.T(), "WORLD", os.Getenv("HELLO"))
}

// 'go test' でsuiteを実行するために、*testing.Tを引数にもつ通常のテストを作って
// suite.Runを実行する
func TestMyTestSuite(t *testing.T) {
    suite.Run(t, new(MyTestSuiteStruct))
}
````

各テスト前後にそれぞれ、 `SetupTest()` と `TearDownTest()` が実行される。
下記のインターフェースをそれぞれ実装することで実行される仕組みとなっている。

````go
type SetupTestSuite interface {
    SetupTest()
}

type TearDownTestSuite interface {
    TearDownTest()
}
````

他にもテスト全体の前後に一回実行される処理も定義することができる。
[こちらを参照](https://pkg.go.dev/github.com/stretchr/testify/suite)
