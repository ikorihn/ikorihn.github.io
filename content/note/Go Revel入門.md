---
title: Go Revel入門
date: 2022-12-14T14:34:00+09:00
tags:
- Go
---

https://revel.github.io/tutorial/index.html

````shell
# revelコマンドをインストール
$ go install github.com/revel/cmd/revel@latest
$ revel
Usage:
  revel [OPTIONS] <command>

Application Options:
  -v, --debug                If set the logger is set to verbose
      --historic-run-mode    If set the runmode is passed a string not json
      --historic-build-mode  If set the code is scanned using the original parsers, not the go.1.11+
  -X, --build-flags=         These flags will be used when building the application. May be specified multiple times, only applicable for Build, Run, Package, Test commands
      --gomod-flags=         These flags will execute go mod commands for each flag, this happens during the build process

Available commands:
  build
  clean
  new
  package
  run
  test
````

myapp という名前でプロジェクトを作成

````shell
$ revel new -a myapp
$ cd myapp
$ revel run
Revel executing: run a Revel application
WARN  14:32:45 harness.go:179: No http.addr specified in the app.conf listening on localhost interface only. This will not allow external access to your application
Change detected, recompiling
Parsing packages, (may require download if not cached)... Completed
INFO  14:32:46    app     run.go:34: Running revel server
INFO  14:32:46    app   plugin.go:9: Go to /@tests to run the tests.
Revel engine is listening on.. localhost:51839
Revel proxy is listening, point your browser to : 9000
````

http://localhost:9000 で画面が開く

### 設定

`conf/app.conf` に設定値を書く
portなどもここ

`conf/routes` にルーティングを書く

### View

`app/views/App/Index.html`

````html
{{set . "title" "Home"}}
{{template "header.html" .}}

<header class="jumbotron" style="background-color:#A9F16C">
  <div class="container">
    <div class="row">
      <h1>It works!</h1>
      <p></p>
    </div>
  </div>
</header>

<div class="container">
  <div class="row">
    <div class="span6">
      {{template "flash.html" .}}
    </div>
  </div>
</div>

{{template "footer.html" .}}

````

## 感想

* 古き良きMVCフレームワークという感じ。TomcatのServletの開発に体験としては近い？
* Viewも備えていてJSPみたいに書ける
* scaffold、サーバー起動、ディレクトリ構成、設定ファイルなど予め決められていて、こちらで決めることは少ない
* REST APIの構築には大きすぎる感じ、Goっぽくない
