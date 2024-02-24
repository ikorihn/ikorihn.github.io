---
title: go カスタムエラー
date: "2023-05-05T19:06:00+09:00"
tags:
  - Go
---

 
[[Go]] でカスタムエラーを作る

[[aws-sdk-go-v2 でのエラーハンドリング]]
https://github.com/aws/aws-sdk-go-v2/issues/1110


```go
if err != nil {
    var myerr *MyError
    if errors.As(err, &myerr) {
        return nil, ErrHoge
    }
    return nil, err
}
```
