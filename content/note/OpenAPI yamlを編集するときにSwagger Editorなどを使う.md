---
title: OpenAPI yamlを編集するときにSwagger Editorなどを使う
date: 2023-01-05T16:49:00+09:00
tags:
- 2023/01/05
- OpenAPI
---

OpenAPI specを書くツールをいくつか調べた

* vscodeだと拡張を入れてもいまいち補完が効かない
* Intellij IDEAの [OpenAPI Editor](https://plugins.jetbrains.com/plugin/12887-openapi-editor) が一番良さそうだがJetBrainsライセンス必要
* Stoplight Studioはいいけど勝手にファイルをフォーマットかけたりするし重い。会員登録必要
* Swagger Editor は補完聞くけどブラウザ上で編集ってのが気持ち悪い
* Swagger Editorをdockerでローカルに立ち上げて使うのがいいのかな

## 結論

どちらかが良さそう。書きやすいのはvimで、補完効かせたかったらSwagger Editor

* Swagger Editor (OpenAPI 3.0.x) で書く
* Neovim + LSPで書いて、ReDocで描画する

## Swagger Editorをローカルに立ち上げる

````shell
$ docker run -it --rm -p 8080:8080 -v $(pwd):/tmp -e SWAGGER_FILE=/tmp/openapi.yaml swaggerapi/swagger-editor
````

localhost:8080 でSwagger Editorが開く

ここで編集しても、ファイルが書き換わるわけではなかったので、いちいち保存してローカルで上書きとかが必要

### v5を使ってみる

v5はまだ安定版じゃないが使ってみる

````shell
docker run -d -p 8080:8080 -v $(pwd):/tmp swaggerapi/swagger-editor:next-v5
````

画面はスッキリしたが、ファイルが指定できなくてまだ早いかも

## ReDocで描画する

Swagger Editorは[Swagger UI](https://swagger.io/tools/swagger-ui/)を描画に使うが、OAS 3.1.0に対応していない。
https://github.com/swagger-api/swagger-ui/issues/5891

そこでRedocを使う

https://hub.docker.com/r/redocly/redoc/

````shell
$ ls openapi.yaml
$ docker run -it --rm -p 3000:80 -v $(pwd):/usr/share/nginx/html/swagger/ -e SPEC_URL=swagger/openapi.yaml redocly/redoc
````

localhost:3000 で開くと、指定したファイルが描画されている。
ホットリロードもしてくれる。

(素直に3.0.xにしてswagger-uiで表示するのが簡単な気がした)

## LSP + Neovim

https://github.com/luizcorreia/spectral-language-server
これはメンテされてなくて `npm i -g spectral-language-server`  がまず失敗した

### jsonla

https://www.reddit.com/r/neovim/comments/r5l1ax/anyone_has_a_successful_experience_with_openapi/
[b0o/SchemaStore.nvim: 🛍 JSON schemas for Neovim](https://github.com/b0o/SchemaStore.nvim)
これが紹介されてた

````shell
$ npm i -g vscode-langservers-extracted
````

packer

````lua
use "b0o/schemastore.nvim"
````

````lua
  settings = {
    json = {
      schemas = require('schemastore').json.schemas(),
      validate = { enable = true },
    },
  },
````

だいたい補完がきくようになったが、schemaの中は全然補完されず
schemaの中はIntellijでも補完されなかったので、すべて補完きかせたかったらSwagger Editorになるか

### yamlls

nvim-lspでyaml-language-serverを使うようになっている
https://github.com/neovim/nvim-lspconfig/blob/e69978a39e4d3262b09ce6a316beff384f443e3b/doc/server_configurations.md#yamlls
https://github.com/williamboman/mason-lspconfig.nvim/blob/3751eb5c56c67b51e68a1f4a0da28ae74ab771c1/doc/server-mapping.md

こちらでデフォルトでOpenAPI 3.1.0 が組み込まれていたのでyamlの場合はこれで十分だった

https://github.com/redhat-developer/yaml-language-server/blob/18ecc0e3d0ff6365e67b88127ac663351b0308de/src/languageservice/utils/schemaUrls.ts#L10
https://github.com/SchemaStore/schemastore/blob/master/src/api/json/catalog.json
