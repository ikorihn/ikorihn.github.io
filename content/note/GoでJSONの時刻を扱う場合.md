---
title: GoでJSONの時刻を扱う場合
date: "2021-07-05T10:59:00+09:00"
lastmod: '2021-07-05T11:16:41+09:00'
tags:
  - 'Go'

---

#Go

## JSONのmarshal/unmarshalで日時フォーマットを指定する

[データをJSONに変換するときに任意のフォーマットを設定する - Qiita](https://qiita.com/taizo/items/2c3a338f1aeea86ce9e2)

[Marshaler](https://golang.org/pkg/encoding/json/#Marshaler), [Unmarshaler](https://golang.org/pkg/encoding/json/#Unmarshaler) インターフェースを実装することで、任意のフォーマットを指定することができる

```go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

const (
	p = `{"time": "2021/07/01 19:30:00"}`
)

type Message struct {
	Time JSONTime `json:"time"`
}

type JSONTime struct {
	time.Time
}

func (t JSONTime) layout() string {
	return "2006/01/02 15:04:05"
}

func (t *JSONTime) UnmarshalJSON(b []byte) error {
	loc := loadLocation()
	// 囲み文字の"をつけるのを忘れない
	ret, err := time.ParseInLocation(`"`+t.layout()+`"`, string(b), loc)
	if err != nil {
		fmt.Println(err)
		return err
	}
	*t = JSONTime{ret}
	return nil
}

func (t JSONTime) MarshalJSON() ([]byte, error) {
	return []byte(`"` + t.Format(t.layout()) + `"`), nil
}

func loadLocation() *time.Location {
	// タイムゾーンの指定
	loc, _ := time.LoadLocation("Asia/Tokyo")
	return loc
}

func main() {
	var message Message
	err := json.Unmarshal([]byte(p), &message)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf("Time unmarshaled: %s\n", message.Time)

	loc := loadLocation()
	now := time.Date(2021, 8, 25, 18, 20, 0, 0, loc)

	message.Time = JSONTime{now}
	b, err := json.Marshal(&message)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Marshalled: %s\n", b)
}
```

## タイムゾーンを扱う場合

タイムゾーンを指定しない場合、 `time.Parse` はデフォルトでUTCになるためJSTなどにしたい場合は明示的に指定する

[Goでtime.Parseを使うときのタイムゾーンについて](https://blog.70-10.net/2018/07/31/go-time-parse/)

### `time.Parse` でタイムインジケータを含めてパースする

```go
// タイムインジケータを指定すると、そのタイムゾーンで解釈される
// タイムインジケータを認識させたい場合はformatに含める
t, _ := time.Parse("2006-01-02 15:04:05 (MST)", "2021-07-02 08:30:00 (JST)")
```

## `time.ParseInLocation` でロケーションを指定する

```go
// 第3引数でtime.Locationを指定することで、タイムインジケータなしでタイムゾーンを指定できる
jst, _ := time.LoadLocation("Asia/Tokyo")
t1, _ := time.ParseInLocation("2006-01-02 15:04:05", "2021-07-02 08:30:00", jst)

// 第3引数でロケーションを指定し、かつ文字列内でタイムインジケータが指定されている場合は、
// タイムインジケータの設定が有効になる
// => 2021-07-02 08:30:00 UTC
t2, _ := time.ParseInLocation("2006-01-02 15:04:05 (MST)", "2021-07-02 08:30:00 (UTC)", jst)
```
