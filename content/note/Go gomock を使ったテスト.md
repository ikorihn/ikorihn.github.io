---
title: Go gomock を使ったテスト
date: 2022-11-17T13:50:00+09:00
tags:
- Go
lastmod: 2022-11-17T13:50:00+09:00
---

\#Go

https://github.com/golang/mock

Goのinterfaceからmockを生成するツール + 生成したコードをテストコード内で利用するためのライブラリ

`s3api.go`

````go
type S3Api interface {
	DeleteObject(ctx context.Context, params *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error)
	GetObject(ctx context.Context, params *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error)
	ListObjectsV2(ctx context.Context, params *s3.ListObjectsV2Input, optFns ...func(*s3.Options)) (*s3.ListObjectsV2Output, error)
}
````

````shell
$ go install github.com/golang/mock/mockgen@latest
$ mockgen -source=repository/s3api.go -destination=repository/mock/s3api.go
````

ソースファイル内にgo:generateディレクティブを書くことで、 `go generate` コマンドで生成されるようになる

````go
//go:generate mockgen -source=$GOFILE -destination=../$GOPACKAGE/mock/$GOFILE
````

### テストコード内での使い方

````go
import (
	"context"
	"testing"

	mock_repository "my/repository/mock"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestService(t *testing.T) {
	// gomock Controllerを初期化
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックメソッドの挙動を指定
	ctx := context.Background()
	repoMock := mock_repository.NewMockS3Api(ctrl)
	repoMock.EXPECT().GetObject(ctx, &s3.GetObjectInput{}. nil).Return(&s3.GetObjectOutput{}, nil)

	// モックを注入
	srv := Service{
		repo: repoMock,
	}

	// テストメソッドを実行
	ok, err := srv.IsExistEntity(1)
	if err != nil {
		t.Errorf("予期せぬエラー: %v", err)
	} else if !ok {
		t.Errorf("期待: %v, 実際: %v", true, ok)
	}
}
````

## gomockhandler

[Goで大量のモックをより統一的に管理し、もっと高速に生成したい！そうだ！！gomockhandlerを使おう！！ | メルカリエンジニアリング](https://engineering.mercari.com/blog/entry/20210406-gomockhandler/)

````shell
go install github.com/sanposhiho/gomockhandler@latest
````

## testify、mockery

https://github.com/stretchr/testify にもmockパッケージが存在する。

mockの作成は [mockery](https://github.com/vektra/mockery) を使う。
gomockに比べた優位性を書いてくれているが正直好みでって感じ。testifyにどっぷり浸かるならこちらでいいと思う
https://vektra.github.io/mockery/#why-use-mockery-over-gomock

### mock作成

以下のコマンドで、dir配下のすべてのinterfaceに対してmockが作成される。
`--inpackage` をつけることでinterfaceと同じパッケージに `mock_<interface名>.go` で作成される。

````
$ mockery --all --dir=src --inpackage
````

## 参考

* [gomockを完全に理解する](https://zenn.dev/sanpo_shiho/articles/01da627ead98f5)
* [go generateでモックを生成する - Carpe Diem](https://christina04.hatenablog.com/entry/use-go-generate-when-generating-mock)
