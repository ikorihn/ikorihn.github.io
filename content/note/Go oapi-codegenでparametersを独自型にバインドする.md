---
title: Go oapi-codegenでparametersを独自型にバインドする
date: "2023-06-08T11:27:00+09:00"
tags:
  - '2023/06/08'
  - Go
---

https://github.com/deepmap/oapi-codegen#extensions

こちらに書いてあるとおりだが、 [[oapi-codegen]] でstringやintといった基本型以外の型にバインディングするには以下のようにする

```yaml
components:
  schemas:
    Fruits:
      type: string
      enum:
        - orange
        - apple
        - banan
      description: favorite fruits
      x-go-type: mypackage.Fruits
      x-go-type-import:
        path: example.com/mypackage
```

```go
package mypackage

type Fruits string

const (
	Apple  Fruits = "apple"
	Orange Fruits = "orange"
	Banana Fruits = "banana"
)
```

生成されるコードは以下のようにtype aliasが使われる。

```go
// Fruits
type Fruits = mypackage.Fruits
```
