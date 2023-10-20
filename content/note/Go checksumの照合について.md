---
title: Go checksumの照合について
date: 2023-07-10T14:54:00+09:00
tags:
- 2023/07/10
- Go
---

[Go](note/Go.md) のモジュールを [JFrog Artifactory](note/JFrog%20Artifactory.md) にアップして取得する運用をしているのだが、モジュールをGitリポジトリから取得した場合とJFrogから取得した場合でハッシュ値が異なる事象があり、
go.sum、checksumの理解が浅いことに気づいたので調べた。

## Checksum Database

https://go.dev/blog/module-mirror-launch

Go modulesで導入された go.sum ファイルには、各依存関係が最初にダウンロードされたときのソースコードとgo.modファイルのSHA-256ハッシュのリストが含まれている。
このハッシュ値を使用して、同じバージョンで異なるコードが提供された場合に検出することができる。

では初回ダウンロード時にどこと照合したらよいだろうか。
依存関係のバージョンを追加する際(または既存の依存関係をアップデートする際)、goコマンドはコードを取得し、go.sumに行を追加する。
問題は、これらの行が正しいかどうかが照合されていないことで、ここで悪意のあるコードに改ざんされていても気づくことができない。

そこでGoは、checksum databaseと呼ばれるグローバルなgo.sumを、sum.golang.org で提供している。
goコマンドが新しいソースコードをダウンロードするとき、そのコードのハッシュをこのグローバルデータベースと照合し、ハッシュが一致することを確認する。
これにより、特定のバージョンのコードをみんなが同じものを使用していることが保証される。

## Privateリポジトリ

https://go.dev/doc/go1.13

Privateリポジトリは、Checksum databaseに記録されない。
そのため普通に `go get` するとエラーになる。
`GOPRIVATE` や `GONOSUMDB` を指定して検証対象外とすることができる。
参考 [Go プライベートリポジトリに対してsshを使ってgo getする](note/Go%20プライベートリポジトリに対してsshを使ってgo%20getする.md)

## checksumを算出する

算出してくれるツールを使ってみる

https://github.com/vikyd/go-checksum

````shell
$ go-checksum ./ github.com/ikorihn/my-module@v1.0.0
directory: ./
{
        "HashSynthesized": "abcdef11111111111111111",
        "HashSynthesizedBase64": "xlsleituieutaiueagab=",
        "GoCheckSum": "h1:xlsleituieutaiueagab="
}

````

## まとめ

冒頭のJFrogのハッシュ値が異なる件は、jfrog cliによって `.jfrog` ディレクトリが作成されたことが原因だった。
これを作成されないようにしてchecksumを算出したところ、JFrog Artifactory にアップロードする前後でハッシュ値が変わらないことが確認できた。
