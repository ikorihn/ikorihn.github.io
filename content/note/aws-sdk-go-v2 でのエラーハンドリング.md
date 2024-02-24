---
title: aws-sdk-go-v2 でのエラーハンドリング
date: "2021-12-01T10:54:00+09:00"
tags:
  - 'Go'
  - 'AWS'
lastmod: "2021-12-01T10:54:00+09:00"
---

#Go #AWS

- aws-sdk-go-v2 でのエラーハンドリング
  - <https://aws.github.io/aws-sdk-go-v2/docs/migrating/#errors-types>
  - v1ではawserrパッケージがあったが、v2では `github.com/aws/aws-sdk-go-v2/service/<service>/types` に該当のエラーの型があるのでcastする

```go
// V2

import "context"
import "github.com/aws/aws-sdk-go-v2/service/s3"
import "github.com/aws/aws-sdk-go-v2/service/s3/types"
import "github.com/aws/smithy-go"

// ...

client := s3.NewFromConfig(cfg)

output, err := s3.GetObject(context.TODO(), &s3.GetObjectInput{
	// input parameters
})
if err != nil {
	var nsk *types.NoSuchKey
	if errors.As(err, &nsk) {
		// handle NoSuchKey error
		return
	}
	var apiErr smithy.APIError
	if errors.As(err, &apiErr) {
		code := apiErr.ErrorCode()
		message := apiErr.ErrorMessage()
		// handle error code
		return
	}
	// handle error
	return
}
```
