---
title: AWS Lambdaでtmpを使うときの注意
date: "2022-11-30T19:13:00+09:00"
tags:
  - 'Go'
  - 'Lambda'
lastmod: "2022-11-30T19:14:00+09:00"
---

#Go #Lambda

<https://aws.amazon.com/jp/about-aws/whats-new/2022/03/aws-lambda-configure-ephemeral-storage/>
<https://cloud5.jp/lambda_tmp_directory/>

`/tmp` を一時領域として10GBまで使うことができる。
Lambdaは一定期間同じインスタンスが再利用され、`/tmp` 領域も使い回される。
zipファイルを `/tmp/` に解凍するようなことをしたとき気をつける必要がある。
前回実行時のファイルが残っている可能性があるので、

- ランダムな名称で作成する
- 処理が終わったら削除する


```
import (
	"log"
	"os"
)

func createFile(text string) (*os.File, error) {
	f, err := os.CreateTemp("/tmp", "W020.nc")
	if err != nil {
		log.Fatalln(err)
	}
	defer f.Close()

	f.WriteString(text)

	return f, err
}

func handler() error {
	f, err := createFile("hello")
	if err != nil {
		return err
	}

	defer os.Remove(f.Name())

}
```
