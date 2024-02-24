---
title: gofakeitを使ってランダムなデータを作成する
date: 2024-01-24T11:56:00+09:00
tags:
  - Go
---

{{< card-link "https://github.com/brianvoe/gofakeit" >}}

こちらのライブラリを使うと、人名や住所、メールアドレスといった様々な種類のランダムなデータを作成することができる。
ダミーデータを大量にDBにインサートしてテストしたい、プロトタイプで適当なデータを使いたいといった場合に便利。

ちなみに日本語での人名や住所を作ってくれるツールもある。

{{< card-link "https://github.com/mattn/go-gimei" >}}

## ダミーの緯度経度の配列を作成する

```go
package main

import (
	"fmt"

	"github.com/brianvoe/gofakeit/v6"
)

func main() {

	positions := make([][]float64, 0)
	for i := 0; i < 10; i++ {
		lat, err := gofakeit.LatitudeInRange(25, 45)
		if err != nil {
			panic(err)
		}
		lon, err := gofakeit.LongitudeInRange(120, 150)
		if err != nil {
			panic(err)
		}

		positions = append(positions, []float64{lon, lat})
	}
	fmt.Printf("%v", positions)

}

```
