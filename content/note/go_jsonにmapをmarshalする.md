---
title: go_jsonにmapをmarshalする
date: 2021-07-07T12:08:00+09:00
lastmod: 2021-07-07T12:08:44+09:00
tags:
- Go
---

\#Go

`map[string]interface{}` をmarshal,unmarshalできる

````go
import (
	"encoding/json"
	"fmt"
)

type required struct {
	Name string
	Age  int
}
type param struct {
	required
	Option map[string]interface{}
}

func main() {
	js := `{
			"name": "John",
			"age": 25,
			"option": {
				"address": {
					"postal": 1555555,
					"name": "X-X-X"
				},
				"height": 172
			}
		}`

	var param param
	err := json.Unmarshal(js, &param)
	if err != nil {
		fmt.Printf("%v", err)
		return
	}
}
````

必須パラメータを埋め込みにしてみた

## オプションのキーをフラットにしたい

上の例では、 `option`のキーにオプションのパラメータを詰めたことで `option: map[string]interface{}` にmarshalできた。
以下のようなJSONはmarshalできるか？

````json
{
  "name": "John",
  "age": 25,
  "address": {
    "postal": 1555555,
    "name": "X-X-X"
  },
  "height": 172
}
````

[dictionary - How to embed a map into a struct so that it has a flat json representation - Stack Overflow](https://stackoverflow.com/questions/31036343/how-to-embed-a-map-into-a-struct-so-that-it-has-a-flat-json-representation)

 > 
 > The short answer is no. The language does not allow you to embed either type (slice or map) in a struct.  
 > Just use a `map[string]interface{}`. Deal with the fact that the values for "key1" and "key2" are strings and everything else is a float somewhere else. That's really the only way you're getting that output. You can make the problem as complicated as you'd like beyond this (like transform into a type more like yours or something) but if you're averse to implementing `MarshalJSON` the only model which will produce the results you want is `map[string]interface{}`

その場合は単に `map[string]interface{}` にするくらい
