{{< card-link "https://github.com/google/jsonnet" >}}

Jsonnetは、データフォーマットを記述するためのプログラミング言語であり、JSONの拡張として設計されています。
Jsonnetを使用すると、複雑なデータ構造をより簡潔に記述でき、再利用性や保守性を向上させることができます。
また、構成管理や設定ファイルの生成など、さまざまな用途で利用されます。


jsonnet用のパッケージマネージャ [jsonnet-bundler](https://github.com/jsonnet-bundler/jsonnet-bundler) を使ってライブラリをインストールできて、 [[GrafonnetでGrafanaを設定してみる|Grafonnet]] を追加したりできる。

```shell
go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
```
