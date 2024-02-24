---
title: aws-sdk-go-v2 Athenaにクエリを投げて結果をページングで受け取る
date: 2023-04-19T23:27:00+09:00
tags:
  - 2023/04/19
  - AWS
lastmod: 2023-04-19T23:27:00+09:00
---


```go
import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/athena"
	"github.com/aws/aws-sdk-go-v2/service/athena/types"
)

type awsClient struct {
	athenaClient *athena.Client
}

func NewAwsClient(ctx context.Context) (*awsClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion("ap-northeast-1"))
	if err != nil {
		return nil, err
	}
	athenaClient := athena.NewFromConfig(cfg)
	return &awsClient{
		athenaClient: athenaClient,
	}, nil
}

type rowData map[string]string

func (ac *awsClient) Query(ctx context.Context, query string, outputLocation string) ([]rowData, error) {
	input := &athena.StartQueryExecutionInput{
		QueryString: aws.String(query),
		ResultConfiguration: &types.ResultConfiguration{
			OutputLocation: aws.String(outputLocation),
		},
	}

	output, err := ac.athenaClient.StartQueryExecution(ctx, input)
	if err != nil {
		return nil, err
	}

	queryExecutionId := *output.QueryExecutionId

	err = ac.waitForQueryToComplete(ctx, queryExecutionId)
	if err != nil {
		return nil, err
	}

	rowData, err := ac.processResultRows(ctx, queryExecutionId)
	if err != nil {
		return nil, err
	}

	return rowData, nil
}
func (ac *awsClient) waitForQueryToComplete(ctx context.Context, queryExecutionId string) error {
	input := &athena.GetQueryExecutionInput{
		QueryExecutionId: aws.String(queryExecutionId),
	}

	runCount := 0
	maxRunCount := 10
	sleepSec := 10
	for runCount < maxRunCount {
		output, err := ac.athenaClient.GetQueryExecution(ctx, input)
		if err != nil {
			return err
		}

		switch output.QueryExecution.Status.State {
		case types.QueryExecutionStateSucceeded:
			return nil
		case types.QueryExecutionStateFailed:
			return fmt.Errorf("athena query failed to run with error message: %s", *output.QueryExecution.Status.StateChangeReason)
		case types.QueryExecutionStateCancelled:
			return fmt.Errorf("athena query was cancelled")
		default:
			time.Sleep(time.Duration(sleepSec) * time.Second)
			runCount++
		}
	}

	return fmt.Errorf("athena query was timeout")
}

func (ac *awsClient) processResultRows(ctx context.Context, queryExecutionId string) ([]rowData, error) {
	input := &athena.GetQueryResultsInput{
		QueryExecutionId: aws.String(queryExecutionId),
	}

	rds := make([]rowData, 0)
	rns := make([]string, 0)

	paginator := athena.NewGetQueryResultsPaginator(ac.athenaClient, input)
	first := true
	for paginator.HasMorePages() {
		output, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		if first {
			for _, meta := range output.ResultSet.ResultSetMetadata.ColumnInfo {
				rns = append(rns, *meta.Name)
			}
		}

		for _, v := range output.ResultSet.Rows {
			if first {
				// Ignore first row of first run. It's header row
				first = false
				continue
			}
			rd := rowData{}
			for i, d := range v.Data {
				rd[rns[i]] = *d.VarCharValue
			}
			rds = append(rds, rd)
		}
	}

	return rds, nil
}
```
