---
title: OpenAPI仕様書からGoの構造体を作る
date: "2022-04-08T16:28:00+09:00"
tags:
  - 'Go'
---

<https://github.com/OpenAPITools/openapi-generator>

<https://github.com/deepmap/oapi-codegen>

```shell
$ oapi-codegen -generate "types,server" -package "openapi" openapi.yaml > openapi.gen.go
```

## oapi-codegen で生成したstructにURLパラメータをバインドできない

<https://github.com/deepmap/oapi-codegen/issues/500>

`oapi-codegen -generate "types" -package "openapi" openapi.yaml` で以下のようなコードが生成される

```
type FindPetsParams struct {
	// tags to filter by
	Tags *[]string `json:"tags,omitempty"`

	// maximum number of results to return
	Limit *int32 `json:"limit,omitempty"`
}
```

これをechoのメソッドでBindするとこうなる

```
func ParseFilter(c *echo.Context) error {
	f := tasksapi.FindPetsParams{}
	if err := c.Bind(&f); err != nil {
		return f, err
	}

    fmt.Printf("param: %v\n", f) // => fieldに値がセットされない

	return f, nil
}
```

ParamのstructタグにqueryがついていればBindされる

```
type FindPetsParams struct {
	// tags to filter by
	Tags *[]string `query:"tags,omitempty"`

	// maximum number of results to return
	Limit *int32 `query:"limit,omitempty"`
}
```

generate に server を指定すると、ここを解決したコードを生成してくれるのだが、
ServerInterfaceが全部のAPIをひとつのinterfaceで持っちゃっているので、なんか微妙だなって思っちゃう
