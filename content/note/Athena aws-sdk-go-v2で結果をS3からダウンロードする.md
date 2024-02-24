---
title: Athena aws-sdk-go-v2で結果をS3からダウンロードする
date: 2023-11-08T13:50:00+09:00
tags:
  - Athena
  - Go
---

[[Athena aws-sdk-go-v2で結果を取得する]] で [[Athena]] のAPIを使って結果を取得することができるが、
サイズが大きいときにページネーションを考慮したりメモリを使用するので、[[S3]] からリザルトCSVをダウンロードして、1行ずつ読み込むようにする。

```go
import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const s3Bucket = "aws-athena-query-results-my-bucket"
const s3Key = "my_prefix"
const resultFile = "result.csv"

type s3Client interface {
	GetObject(context.Context, *s3.GetObjectInput, ...func(*s3.Options)) (*s3.GetObjectOutput, error)
}

func DownloadQueryResult(ctx context.Context, s3Client s3Client, queryExecutionId string, outFile string) error {
	file, err := os.Create(outFile)
	if err != nil {
		return err
	}
	defer file.Close()

	key := fmt.Sprintf("%s/%s.csv", s3Key, queryExecutionId)
	downloader := s3manager.NewDownloader(s3Client)
	bytes, err := downloader.Download(ctx, file, &s3.GetObjectInput{
		Bucket: aws.String(s3Bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		log.Fatal(err)
	}

	slog.Info("Downloaded", "file", resultFile, "size(MB)", bytes/1000/1000)
	return nil
}
```

この関数に、AthenaのqueryExecutionIdを渡して、ファイルとしてダウンロードする。
ここではファイルにしているが、 `s3manager.WriteAtBuffer` に変えればbufferに展開される。
`io.PipeWriter` と `io.PipeReader` を使って繋げてやればstreamにもできそう。
