---
title: Go mergoを使って複数のyamlやjsonを一つにマージする
date: 2024-07-23T16:50:00+09:00
tags:
  - Go
---

アプリケーションの設定ファイルをyamlやjsonで管理していて、複数の環境がある場合に、共通の設定値と環境ごとの設定値に分けて管理することがあると思います。[[Kustomize]] のようなイメージです。

[[Go]] でそうした複数の設定値をマージする処理を書くには [darccio/mergo](https://github.com/darccio/mergo) が利用できます。

mergoはstructやmapをマージすることのできるライブラリですので、yamlやjsonのロードは別途ライブラリを入れるなどして実装します。
以下が実装例となります。
 
```go
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path"

	"dario.cat/mergo"
	"github.com/goccy/go-yaml"
)

func main() {
	var dir string
	flag.StringVar(&dir, "dir", "", "")
	flag.Parse()

	fileInDir, err := os.ReadDir(dir)
	if err != nil {
		log.Fatalf("open file or dir: %v\n", err)
	}
	files := make([]string, 0)
	for _, v := range fileInDir {
		files = append(files, path.Join(dir, v.Name()))
	}

	merged, err := merge(files)
	if err != nil {
		log.Fatal(err)
	}

	m, err := yaml.Marshal(merged)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("%s", string(m))
}

func merge(files []string) (map[string]any, error) {
	var merged map[string]any
	for _, f := range files {
		content, err := os.ReadFile(f)
		if err != nil {
			return merged, err
		}

		var s map[string]any
		err = yaml.Unmarshal(content, &s)
		if err != nil {
			return merged, err
		}

		if err := mergo.Merge(&merged, s); err != nil {
			return merged, err
		}
	}

	return merged, nil
}
```
