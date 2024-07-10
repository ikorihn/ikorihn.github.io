---
title: Go ローカルで開発中のモジュールを別の箇所で読み込ませる
date: 2024-06-27T12:31:00+09:00
tags:
  - Go
---

ローカルで開発中の moduleA を、同じくローカルで開発中の applicationA で使いたい場合、通常は一旦 moduleA をBitbucketにpushする必要があります。
これはgoのモジュール管理の仕組みが、リモートのGitリポジトリからモジュールを取得する作りになっているためです。

ですが、変更の都度pushしていては手間がかかります。
これを解決する手段として workspaceモードを使うか、 `replace` があります
 

以下のような構成でディレクトリが配置されているとします。

```
❯ pwd
~/work/go-example
❯ tree
.
├── applicationA <- moduleAを利用するアプリケーション
│  ├── go.mod
│  └── main.go
└── moduleA
   ├── go.mod
   └── hello.go
```
 

## workspaceを使う場合

1.18でWorkspaceモードが導入されました。

~/work/go-example でワークスペースを開始します。

```
$ go work init applicationA moduleA
$ tree
.
├── go.work
├── applicationA
│  ├── go.mod
│  └── main.go
└── moduleA
   ├── go.mod
   └── hello.go
```

※go.workはコミットしない

`go.work` の中身

```
go 1.22.3
use (
	./applicationA
	./moduleA
)
```

これによって、moduleAの変更内容が即座にapplicationAで利用できるようになります。

## go.mod replace を使う場合

1.18以前の手順。ディレクトリが点在していてworkspaceがうまく使えない場合もこれになるのかな

[Go Modules Reference - The Go Programming Language](https://go.dev/ref/mod#go-mod-file-replace) に説明があります。

特定のモジュールを別のモジュールまたはローカルのディレクトリに置き換えることができます。

```
replace module-path [module-version] => replacement-path [replacement-version]
```

例

```
replace github.com/my-account/modulea => ../moduleA
require (
	github.com/my-account/modulea v0.0.0-20240513113427
)
```

### 利用例

`applicationA/go.mod`

```
module github.com/my-account/applicationa
go 1.22.3
require (
	github.com/my-account/modulea v0.0.0-20240513113427
)
```

これをローカルのディレクトリを参照するように変更します。

```shell
$ go mod edit -replace github.com/my-account/modulea=../moduleA
```


```
module github.com/my-account/applicationa
go 1.22.3
replace github.com/my-account/modulea => ../moduleA
require (
	github.com/my-account/modulea v0.0.0-20240513113427
)
```

これで moduleA をローカルで変更すると、applicationA でその変更が反映されるようになります。

```go
package main

import (
	"github.com/my-account/modulea"
)

func main() {
	modulea.Hello("world")
}
```

## 参考

- [Goの共通モジュール管理の方法をまとめてみた（Go1.18で導入されたWorkspaceも） ](https://zenn.dev/hohner/articles/fd9d682871a12b#%E6%96%B0%E3%81%97%E3%81%8F%E5%B0%8E%E5%85%A5%E3%81%95%E3%82%8C%E3%81%9Fworkspace%E6%A9%9F%E8%83%BD) 
- [go.workはmonorepoの夢を見るか - ぽよメモ](https://poyo.hatenablog.jp/entry/2022/12/05/090000)