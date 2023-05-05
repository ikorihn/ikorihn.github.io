---
title: OpenAPIとGoでリクエストのバリデーションをする
date: 2023-01-05T15:51:00+09:00
tags:
- 2023/01/05
- Go
- OpenAPI
---

いつもoapi-codegenでopenapi.yamlからGoのコードを生成するようにしている。
oapi-codegenの使い方については下記参照

[OpenAPIでGoとTypeScriptのコード生成](note/OpenAPIでGoとTypeScriptのコード生成.md)

[OpenAPI仕様書からGoの構造体を作る](note/OpenAPI仕様書からGoの構造体を作る.md)

## OpenAPIでパラメータに制約をつける

OpenAPI Documentでは、JSON Schema の定義に従って `schema` に制約を書くことができる。
[OpenAPI Specification - Version 3.0.3 | Swagger](https://swagger.io/specification/#schema-object)
[draft-wright-json-schema-validation-00](https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00)

次のように `pattern` や `format` 、`maxLength` などが定義できる。

`openapi.yaml`

````yaml
paths:
  /hello:
    get:
      summary: Hello
      operationId: hello
      parameters:
        - name: id
          in: query
          description: user id
          required: true
          schema:
            type: string
            pattern: "^[0-9A-F]+$"
        - name: updated
          in: query
          schema:
            type: string
            format: date-time
````

oapi-codegenを使えば、 `schema` に書いた制約をもとにリクエストのバリデーションを行うことができる。

以下はEchoの場合

````go
package main

import (
	"my-application/oapigen"

	oapiMiddleware "github.com/deepmap/oapi-codegen/pkg/middleware"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// oapi-codegenで生成したコードにあるGetSwagger()でopenapi specを取得
	swagger, err := oapigen.GetSwagger()
	if err != nil {
		panic(err)
	}
	// ホストの検証が必要でなければnilにしておく
	swagger.Servers = nil
	// middlewareにValidatorをセットすることでリクエストの検証が行われる
	e.Use(oapiMiddleware.OapiRequestValidator(swagger))

	// 独自のformatを定義したい場合はこのようにする
	openapi3.DefineStringFormat("custom-date", `^[0-9]{4}-(0[0-9]|10|11|12)-([0-2][0-9]|30|31)T[0-9]{2}:[0-9]{2}:[0-9]{2}$`)


}

````

[OpenAPIスキーマ駆動開発におけるoapi-codegenを用いたリクエストバリデーション - HRBrain Blog](https://times.hrbrain.co.jp/entry/openapi-validation-chi)
こちらに書いてあるとおり、一通りのバリデーションはできるようになっている

middlewareのソースはこちら
https://github.com/deepmap/oapi-codegen/blob/ab90f1927bc5ec3e29af216d4298fbb4780ae36d/pkg/middleware/oapi_validate.go#L58

## 別ライブラリと組み合わせる

https://github.com/go-ozzo/ozzo-validation や https://github.com/go-playground/validator と組み合わせて複雑なバリデーションをしたい場合

`x-oapi-codegen-extra-tags` を書くことで任意のstruct tagをつけることができるので、タグベースのバリデーションはこれで行える
バリデーションの種類はこれ
[go-playground/validator リクエストパラメータ向けValidationパターンまとめ - Qiita](https://qiita.com/RunEagler/items/ad79fc860c3689797ccc)

````yaml
paths:
  /hello:
    get:
      summary: Hello
      operationId: hello
      parameters:
        - name: sort-by
          in: query
          description: How to sort items
          required: false
          schema:
            type: string
          x-oapi-codegen-extra-tags:
            validate: len=5
        - name: datetime
          in: query
          schema:
            type: string
          x-oapi-codegen-extra-tags:
            validate: datetime_without_timezone
````

Echo + go-playground/validator

````go
import (
	"my-application/openapi"

	"github.com/go-playground/validator/v10"
)

func main() {
	e := echo.New()

	swagger, err := openapi.GetSwagger()
	if err != nil {
		panic(err)
	}
	swagger.Servers = nil
	openapi.RegisterHandlers(e, handler{})

	// registor validator
	validate := validator.New()
	validate.RegisterValidation("datetime_without_timezone", validateDatetimeWithoutTimezone)
	e.Validator = &CustomValidator{validate: validate}

}

type CustomValidator struct {
	validate *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validate.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func validateDatetimeWithoutTimezone(fl validator.FieldLevel) bool {
	date := fl.Field().String()
	_, err := time.Parse("2006-01-02T15:04:05", date)
	return err == nil
}

type handler struct {}

func (h handler) Hello(ec echo.Context, params openapi.HelloParams) error {
	if err := ec.Validate(params); err != nil {
		return err
	}
	return ec.String(http.StatusOK, fmt.Printf("Hello, %s", params.Name))
}

````

validatorのエラーメッセージをカスタムしたい

[\[golang\]Echoでvalidatorのエラーを日本語に変換する方法 | CodeLab](https://codelab.website/golang-echo-validator-translation/)
[How can I define custom error message? · Issue #559 · go-playground/validator](https://github.com/go-playground/validator/issues/559)

tagに応じたメッセージを作成する、`validator.ValidationErrors.Translate` で翻訳する(用意された翻訳メッセージ)

````go
package main

import (
	"errors"
	"log"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/go-playground/locales/ja_JP"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	ja_translations "github.com/go-playground/validator/v10/translations/ja"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	validate := validator.New()

	// エラーメッセージに出力するフィールド名をタグから取得する
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		fieldName := field.Tag.Get("field_ja")
		if fieldName == "-" {
			return ""
		}
		return fieldName
	})

	// 日本語のメッセージを出力する
	japanese := ja_JP.New()
	uni := ut.New(japanese, japanese)
	trans, _ := uni.GetTranslator("ja")
	err := ja_translations.RegisterDefaultTranslations(validate, trans)
	if err != nil {
		log.Fatal(err)
	}
	// メッセージを上書きする場合はこのようにする
	validate.RegisterTranslation("required", trans, func(ut ut.Translator) error {
		return ut.Add("required", "{0} を指定してください", true) // see universal-translator for details
	}, func(ut ut.Translator, fe validator.FieldError) string {
		t, _ := ut.T("required", fe.Field())
		return t
	})

	e.Validator = &CustomValidator{validate: validate, trans: trans}

}

type CustomValidator struct {
	trans    ut.Translator
	validate *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validate.Struct(i); err != nil {
		var ve validator.ValidationErrors
		msg := []string{}
		if errors.As(err, &ve) {
			for _, m := range ve.Translate(cv.trans) {
				msg = append(msg, m)
			}
		}

		return echo.NewHTTPError(http.StatusBadRequest, strings.Join(msg, ","))
	}
	return nil
}

type Params struct {
	Id *string `form:"id,omitempty" json:"id,omitempty" validate:"required" field_ja:"ユーザID"`
}

````

=> `ユーザIDは必須フィールドです` というエラーメッセージになる

### 試す

````yaml
openapi: "3.1.0"
paths:
  /hello:
    get:
      summary: Sample API
      operationId: hello
      tags:
        - sample
      parameters:
        - name: name
          in: query
          required: true
          schema:
            type: string
            maxLength: 8
            minLength: 4
          description: your name
        - name: id
          in: query
          schema:
            type: string
            pattern: "^\\d{8}$"
          description: your id
        - name: age
          in: query
          schema:
            type: integer
            maximum: 30
            minimum: 10
          description: your name
````

こんなopenapi.yamlを作って適当なサーバーを立てて、範囲外の値を入力してやるとエラーが返された

localhost:8080/hello?name=alice&age=99

````
parameter "age" in query has an error: number must be at most 30
````

## 日付型のバリデーション

kin-openapiだけだとここで正規表現のみチェックしている
https://github.com/getkin/kin-openapi/blob/e7d649f3f7d6ddbaaaed74a7d2f819a82118aab4/openapi3/schema.go#L943
https://github.com/getkin/kin-openapi/blob/e7d649f3f7d6ddbaaaed74a7d2f819a82118aab4/openapi3/schema_formats.go#L94

`2022-01-02T15:04:05` みたいな文字列が通るはずと思ったが通らなかった。

oapi-codegen のmiddlewareではここで `time.Parse` できるかもチェックしているためだった。
https://github.com/deepmap/oapi-codegen/blob/ab90f1927bc5ec3e29af216d4298fbb4780ae36d/pkg/runtime/bindstring.go#L125

そのため独自フォーマットを用意してあげる必要がある。

````go

import "github.com/getkin/kin-openapi/openapi3"


	openapi3.DefineStringFormat("custom-date", `^[0-9]{4}-(0[0-9]|10|11|12)-([0-2][0-9]|30|31)T[0-9]{2}:[0-9]{2}:[0-9]{2}$`)
````

* [ ] https://github.com/deepmap/oapi-codegen/blob/ab90f1927bc5ec3e29af216d4298fbb4780ae36d/pkg/runtime/deepobject.go#L248 スペルミス直す 📅 2023-01-07
  `deepObject` でdateを指定したときにこうなるぽい
  https://swagger.io/docs/specification/serialization/

````yaml
  /hello:
    get:
      summary: Sample API
      operationId: hello
      tags:
        - admin
      parameters:
        - name: obj
          in: query
          schema:
            type: object
            properties:
              date:
                type: string
                format: date-time
          style: deepObject
          explode: true
````

再現できた。エラーメッセージのtimeがtimになってる
http://localhost:1323/hello?obj\[date\]=2022-12-21T15:04:05

````
Invalid format for parameter obj: error assigning value to destination: error assigning field [date]: error parsing tim as RFC3339 or 2006-01-02 time: parsing time "2022-12-21T15:04:05": extra text: "T15:04:05"
````
