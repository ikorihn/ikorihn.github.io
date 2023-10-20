---
title: Go DynamoDBのコンソールからダウンロードしたCSVをBatchでputする
date: 2023-09-06T19:25:00+09:00
tags:
- Go
---

DynamoDB Localを使ってローカルでテストしようとしたとき、データセットをDynamoDBから落としてきて突っ込もうとした。

最初aws-sdk-goの `BatchWriteItem` で書き込もうとしたら、1度に処理できる最大件数が25件だった。
これはAPIのクウォータなのでaws cliでも同じ。
分割して実行すればいいのだが、サボって guregu/dynamo を使った。guregu/dynamo も中で分割して実行している。

````csv
"name","props"
"駒場","[{""M"":{""available"":{""BOOL"":true},""color"":{""S"":""blue""},""distance"":{""N"":12345}}]"
"三田","[{""M"":{""available"":{""BOOL"":false},""color"":{""S"":""green""},""distance"":{""N"":9999}}]"
...
````

````go
package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/guregu/dynamo"
)

const region = "ap-northeast-1"

func main() {
	ctx := context.Background()

	conf := &aws.Config{
		Region:     aws.String(region),
		DisableSSL: aws.Bool(true),
		Endpoint:   aws.String("http://localhost:8000"),
	}

	ses, err := session.NewSession(conf)
	if err != nil {
		log.Fatal(err)
	}

	client := dynamo.New(ses)

	dynamoTable := client.Table("dev_multilang_verdy_t")

	records, err := createRecords()
	if err != nil {
		log.Fatal(err)
	}

	putValues := make([]interface{}, len(records))
	for i, v := range records {
		putValues[i] = v
	}

	wrote, err := dynamoTable.Batch().Write().Put(putValues...).RunWithContext(ctx)
	if err != nil {
		log.Fatalf("cannot write items: %v", err)
	}

	fmt.Printf("Wrote %d records\n", wrote)

}

type record struct {
	Name  string     `dynamo:"name"`
	Props []property `dynamo:"props"`
}
type property struct {
	Available bool   `dynamo:"available"`
	Color     string `dynamo:"color"`
	Distance  int    `dynamo:"distance"`
}

func createRecords() ([]record, error) {
	f, err := os.Open("records.csv")
	if err != nil {
		return nil, err
	}

	c := csv.NewReader(f)
	records, err := c.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("cannot read csv: %w", err)
	}

	dynamoRec := make([]record, 0)
	header := true
	for _, v := range records {
		if header {
			header = false
			continue
		}
		name := v[0]
		item := v[1]

		// まずAttributeValueにUnmarshalしてから、他のstructに変換する
		var atvs []*dynamodb.AttributeValue
		if err := json.Unmarshal([]byte(item), &atvs); err != nil {
			return nil, fmt.Errorf("cannot unmarshal json: %w", err)
		}
		var prop []property
		if err := dynamodbattribute.UnmarshalList(atvs, &prop); err != nil {
			return nil, fmt.Errorf("cannot unmarshal dynamodbattribute: %w", err)
		}

		dynamoRec = append(dynamoRec, record{
			Name:  name,
			Props: prop,
		})

	}

	return dynamoRec, nil
}

````
