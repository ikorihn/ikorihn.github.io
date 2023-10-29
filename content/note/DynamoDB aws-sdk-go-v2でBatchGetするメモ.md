---
title: DynamoDB aws-sdk-go-v2でBatchGetするメモ
date: 2023-09-22T11:56:00+09:00
tags:
- Go
- DynamoDB
lastmod: 2023-10-29T17:27:42+09:00
---

[Go](note/Go.md) でDynamoDBを操作するときguregu/dynamoを使うことも多いが、[BatchGetが遅い](note/guregu%2FdynamoでのBatchGetが遅いので調べた.md) ことがあったのとaws-sdk-go v1に対応していないので、直接aws-sdk-go-v2を使うことにした

## BatchGetするサンプル

BatchGetItemを直接使うサンプルは公式になかったので、PartiQLを使う例を参考にして作ってみた。

[aws-doc-sdk-examples/gov2/dynamodb/actions/partiql.go at main · awsdocs/aws-doc-sdk-examples](https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/gov2/dynamodb/actions/partiql.go#L153)

````go
package dynamo

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	awsLogging "github.com/aws/smithy-go/logging"
)

type MusicRecord struct {
	Artist    string
	SongTitle string
}

// maxBatchGetItems is max size for one BatchGetItem request
const maxBatchGetItems = 100

func BatchGet(
	ctx context.Context,
	region string,
	endpoint string,
	targetTable string,
	titles []string,
) ([]MusicRecord, error) {
	// initialize client
	conf, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		config.WithLogger(awsLogging.NewStandardLogger(os.Stdout)),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}

	dynamo := dynamodb.NewFromConfig(conf, func(o *dynamodb.Options) {
		if endpoint != "" {
			// set endpoint
			o.BaseEndpoint = &endpoint
		}
	})

	// create DynamoDB keys
	dynamoKeys := make([]map[string]types.AttributeValue, 0)
	for _, v := range titles {
		dynamoKeys = append(dynamoKeys, map[string]types.AttributeValue{
			"SongTitle": &types.AttributeValueMemberS{Value: v},
		})
	}

	chunkedKeys := chunk(dynamoKeys, maxBatchGetItems)
	responses := make([]map[string]types.AttributeValue, 0)
	for _, k := range chunkedKeys {
		// BatchGet value from dynamoDB
		input := &dynamodb.BatchGetItemInput{
			RequestItems: map[string]types.KeysAndAttributes{
				targetTable: {Keys: k},
			},
		}

		out, err := dynamo.BatchGetItem(ctx, input)
		if err != nil {
			return nil, fmt.Errorf("failed in get items: %w", err)
		}
		responses = append(responses, out.Responses[targetTable]...)
	}

	// unmarshal DynamoDB list items to struct
	records := []MusicRecord{}
	if err := attributevalue.UnmarshalListOfMaps(responses, &records); err != nil {
		return nil, fmt.Errorf("failed in unmarshal records: %w", err)
	}

	return records, nil
}

func chunk[T any](collection []T, chunkSize int) [][]T {
	if chunkSize <= 0 {
		panic("Second parameter must be greater than 0")
	}

	result := make([][]T, 0)

	for len(collection) > 0 {
		if len(collection) < chunkSize {
			chunkSize = len(collection)
		}

		result = append(result, collection[0:chunkSize])
		collection = collection[chunkSize:]
	}

	return result
}

````
