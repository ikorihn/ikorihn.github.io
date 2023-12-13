---
title: Athena aws-sdk-go-v2で結果を取得する
date: 2023-11-08T13:50:00+09:00
tags:
- Athena
- Go
---

タイトルまんまなのでさっそくサンプルコード

## サンプルコード

````go
import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/athena"
	"github.com/aws/aws-sdk-go-v2/service/athena/types"
)

const (
	baseDelay = time.Second
	maxDelay  = 30 * time.Second
)

type awsClient struct {
	athena *athena.Client
}

func NewAwsClient(ctx context.Context, region string) (*awsClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return nil, err
	}
	athenaClient := athena.NewFromConfig(cfg)
	return &awsClient{
		athena: athenaClient,
	}, nil
}

type rowData map[string]string

func (ac *awsClient) Search(ctx context.Context, s3Bucket, s3Key string, query string, timeout time.Duration) (*string, error) {
	queryExecutionId, err := ac.startQuery(ctx, s3Bucket, s3Key, query)
	if err != nil {
		return nil, err
	}

	err = ac.waitForQueryToComplete(ctx, queryExecutionId, timeout)
	if err != nil {
		return nil, err
	}

	return queryExecutionId, nil
}

func (ac *awsClient) startQuery(ctx context.Context, s3Bucket, s3Key string, query string) (*string, error) {
	outputLocation := fmt.Sprintf("s3://%s/%s/", s3Bucket, s3Key)

	input := &athena.StartQueryExecutionInput{
		QueryString: aws.String(query),
		ResultConfiguration: &types.ResultConfiguration{
			OutputLocation: aws.String(outputLocation),
		},
	}

	output, err := ac.athena.StartQueryExecution(ctx, input)
	if err != nil {
		return nil, err
	}

	return output.QueryExecutionId, nil
}

func (ac *awsClient) waitForQueryToComplete(ctx context.Context, queryExecutionId *string, timeout time.Duration) error {
	input := &athena.GetQueryExecutionInput{
		QueryExecutionId: queryExecutionId,
	}

	startTime := time.Now()
	expire := startTime.Add(timeout)
	count := 0
	for {
		output, err := ac.athena.GetQueryExecution(ctx, input)
		if err != nil {
			return err
		}

		switch output.QueryExecution.Status.State {
		case types.QueryExecutionStateSucceeded:
			// success
			return nil
		case types.QueryExecutionStateFailed:
			return fmt.Errorf("athena query failed to run with error message: %s", *output.QueryExecution.Status.StateChangeReason)
		case types.QueryExecutionStateCancelled:
			return fmt.Errorf("athena query was cancelled")
		default:
			if time.Now().After(expire) {
				_, err := ac.athena.StopQueryExecution(ctx, &athena.StopQueryExecutionInput{
					QueryExecutionId: queryExecutionId,
				})
				if err != nil {
					return fmt.Errorf("cannot stop athena query")
				} else {
					return fmt.Errorf("athena query was timeout")
				}
			}

			delay := backoff(count, baseDelay, maxDelay)
			time.Sleep(delay)
			count++
		}
	}
}

func (ac *awsClient) processResultRows(ctx context.Context, queryExecutionId string) ([]rowData, error) {
	input := &athena.GetQueryResultsInput{
		QueryExecutionId: aws.String(queryExecutionId),
	}

	rds := make([]rowData, 0)
	rns := make([]string, 0)

	paginator := athena.NewGetQueryResultsPaginator(ac.athena, input)
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

func backoff(attempt int, baseDelay, maxDelay time.Duration) time.Duration {
	maxf := float64(maxDelay)
	basef := float64(baseDelay)

	durf := basef * math.Pow(2, float64(attempt))
	durf = rand.Float64()*(durf-basef) + basef

	if durf > maxf {
		durf = maxf
	}

	return time.Duration(durf)
}
````

## ポイント

* クエリを開始する
* クエリの結果を待つ
  * このとき、[Exponential Backoff and Jitter](Exponential%20Backoff%20and%20Jitter.md) でリトライすることでリクエスト回数を減らしている
* 結果を取得する
  * `athena.GetQueryResultsPaginator` を使いページネーションを簡単に実装できる
