---
title: OpenAPIのspecからSAMのTemplate.yamlを生成する
date: 2023-05-05T21:25:00+09:00
tags:
- OpenAPI
- Lambda
---

[SAM](note/SAM.md) と [OpenAPI](note/OpenAPI.md) を組み合わせて使うときに両方を編集するのが大変&漏れやすいので合わせられる仕組みが欲しかった

````yaml
openapi: 3.0.0
info:
  title: OpenAPI sam-app
  description: sam-appのAPI
  version: 1.0.0

paths:
  /hello:
    get:
      summary: GETサンプル
      description: GETのサンプルです
      responses:
        '200':
          description: 成功レスポンス
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Success'
      x-amazon-apigateway-integration:
        credentials:
          Fn::Sub: ${ApiRole.Arn}
        uri:
          Fn::Sub: arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${GetFunction.Arn}/invocations
        passthroughBehavior: when_no_templates
        httpMethod: POST
        type: aws_proxy
    post:
      summary: POSTサンプル
      description: POSTのサンプルです
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  description: 名前
                  type: string
                age:
                  description: 年齢
                  type: integer
                  format: int32
              required:
                - name
                - age
      responses:
        '200':
          description: 成功レスポンス
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Success'
      x-amazon-apigateway-integration:
        credentials:
          Fn::Sub: ${ApiRole.Arn}
        uri:
          Fn::Sub: arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${PostFunction.Arn}/invocations
        passthroughBehavior: when_no_templates
        httpMethod: POST
        type: aws_proxy

components:
  schemas:
    Success:
      description: 成功の場合のレスポンス
      type: object
      properties:
        message:
          type: string
      required:
        - message

````

````go
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io"
	"log"
	"sort"
	"strings"

	"github.com/getkin/kin-openapi/jsoninfo"
	"github.com/getkin/kin-openapi/openapi3"
)

// x-amazon-apigateway-integration の型定義
type apigateway struct {
	Type string `yaml:"type" json:"type"`
	Uri  cfn    `yaml:"uri" json:"uri"`
}

type cfn struct {
	FnSub string `yaml:"Fn::Sub" json:"Fn::Sub"`
}

// template.yaml に記載するLambda Functionのテンプレート
const lamdbaFunctionTemplateString = `{{ .FunctionName }}:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: !Sub {{ .OperationId }}
    Description: !Sub "{{ .Description }}"
    CodeUri: {{ .ExecutablePath }}
    Role: !Sub ${Role}
    Events:
      CatchAll:
        Type: Api
        Properties:
          Path: {{ .Path }}
          Method: GET
          RestApiId: !Ref MyAPI`

type lambdaFunctionTemplate struct {
	FunctionName   string
	OperationId    string
	Description    string
	ExecutablePath string
	Path           string
}

func extractFunctionName(apigw apigateway) string {
	uri := apigw.Uri.FnSub
	arn := strings.Split(uri, "/")[3]
	return strings.ReplaceAll(strings.Trim(arn, "${}"), ".Arn", "")
}

func extractExecutablePath(functionName string) string {
	rfn := []rune(strings.ReplaceAll(functionName, "Function", ""))
	return strings.ToLower(string(rfn[0])) + string(rfn[1:])
}

func makeTemplateValue(path string, opearation *openapi3.Operation) lambdaFunctionTemplate {
	dec, err := jsoninfo.NewObjectDecoder(opearation.Extensions["x-amazon-apigateway-integration"].(json.RawMessage))
	if err != nil {
		log.Fatal(err)
	}

	var apigw apigateway
	if err = opearation.DecodeWith(dec, &apigw); err != nil {
		panic(err)
	}

	functionName := extractFunctionName(apigw)
	executablePath := extractExecutablePath(functionName)

	return lambdaFunctionTemplate{
		FunctionName:   functionName,
		OperationId:    opearation.OperationID,
		Description:    opearation.Description,
		ExecutablePath: executablePath,
		Path:           path,
	}
}

func convertToTemplateValues(spec *openapi3.T) []lambdaFunctionTemplate {
	paths := make([]string, 0, len(spec.Paths))
	for path := range spec.Paths {
		paths = append(paths, path)
	}
	sort.Strings(paths)

	templates := make([]lambdaFunctionTemplate, 0, len(paths))

	for _, path := range paths {
		v := spec.Paths[path]

		operations := make([]*openapi3.Operation, 0)
		operations = append(operations, v.Connect, v.Delete, v.Get, v.Head, v.Options, v.Patch, v.Post, v.Put, v.Trace)

		for _, o := range operations {
			if o != nil {
				templateValue := makeTemplateValue(path, o)
				templates = append(templates, templateValue)
			}
		}
	}

	return templates
}

func outTemplate(writer io.Writer, templateValues []lambdaFunctionTemplate) {
	for _, v := range templateValues {
		tmpl, err := template.New("lambda").Parse(lamdbaFunctionTemplateString)
		if err != nil {
			log.Fatal(err)
		}

		if err := tmpl.Execute(writer, v); err != nil {
			log.Fatal(err)
		}
		writer.Write([]byte("\n"))
	}

}

func main() {
	var filePath string
	flag.StringVar(&filePath, "f", "openapi.yaml", "OpenAPI specification file path ex.) openapi.yaml")

	flag.Parse()

	loader := openapi3.NewLoader()

	spec, err := loader.LoadFromFile(filePath)
	if err != nil {
		log.Fatal(err)
	}

	templates := convertToTemplateValues(spec)
	writer := new(strings.Builder)

	outTemplate(writer, templates)

	fmt.Println(writer.String())

}
````
