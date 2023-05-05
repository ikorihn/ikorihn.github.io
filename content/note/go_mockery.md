---
title: go_mockery
date: 2021-07-14T20:41:00+09:00
tags:
- Go
- unittest
---

[go_testifyを使う](note/go_testifyを使う.md) でtestify/mockを使ったが、
mockを手で作成するのは骨が折れる

そこでtestifyのmock生成には [mockery](https://github.com/vektra/mockery) を使うと便利

## インストール

dockerやbrewでもインストールできる。`go install` で入れる場合は以下

````shell
go install github.com/vektra/mockery/v2@latest
````

## gomockとの比較

mockライブラリといえば [gomock](https://github.com/golang/mock) も有名

testifyを使わない場合はこちらでもいいと思う

## 余談

一時期メンテナンスされていなかったが、引き継いだメンテナがいて開発再開された。

https://github.com/vektra/mockery/issues/237#issuecomment-622492842

今はv2だが、[v3対応中](https://github.com/vektra/mockery#v3)らしい
