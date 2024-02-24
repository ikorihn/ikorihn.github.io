---
title: go_install
date: "2021-06-09T18:59:00+09:00"
tags: 
---

#Go 

# go install

go 1.16から、グローバルにインストールする機能が追加された

いままでgo.modのないディレクトリに移動して

```shell
GOMODULE111=off go get github.com/xxx
```

とかやってたのを、

```shell
go install github.com/xxx@latest
```

で$GOPATH/binにインストールされるようになった


## go clean

`-i` で go install で作られたものを削除する

### 削除前にコマンドを確認する

```bash
go clean -i -n github.com/sample_user/sample
```

### 削除する

```bash
go clean -i github.com/sample_user/sample
```

src配下に残っているものは消えないので、手動で対象ディレクトリをまるごと削除する

```bash
rm -rf $GOPATH/src/github.com/sample_user/sample
```
