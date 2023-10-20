---
title: OpenAPI Generator
date: 2021-05-19T14:12:00+09:00
lastmod: 2021-05-19T14:12:25+09:00
tags:
- OpenAPI
---

\#OpenAPI

---

## 伝えたいこと

* OpenAPI(Swagger)を使って、APIクライアントのコードを自動生成しよう
  * コードと仕様書に齟齬がなくなる
  * Nullable/NonNull、スペルミス、APIインターフェース変更への追従が確実&簡単になる
* 最初期に導入するほうが効果が高く、途中から導入するのは難しい…
* コマンド例

````shell
$ docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate
    -i https://petstore3.swagger.io/api/v3/openapi.json
    -g typescript-axios -o /local/client
$ ls client
api.ts  base.ts  configuration.ts  git_push.sh  index.ts
````

---

## フロントエンド開発時に困ること

* APIのレスポンスの型を定義するのが手間
  * 手で書いたり、JSONから変換したり
* 仕様変更に追従しなければいけない
* Nullable/NonNullの認識ミス

---

<!-- _class: center -->

自動生成できないか :tired_face:

---

<!-- _class: center -->

Swagger仕様書から作ろう :bulb:

---

## OpenAPI(Swagger)

* Swagger 3.0からOpenAPIに名前がかわっている
* 2021/05/19現在の最新は、3.1.0
  * <https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md>
* RESTful APIに関するインターフェース定義
* 定義書はJSONファイルやYAMLファイル

---

## OpenAPI Generator

* OpenAPIのスキーマ定義からコード生成できる
* 生成できる言語・FWは多数サポートされている
* 利用方法が多数用意されている
  * CLI
  * Maven Plugin

---

<div class="chapter">OpenAPI Generator</div>

### 試してみる

サンプルとして公開されている定義ファイルを使います

* Swagger UI: <https://petstore3.swagger.io/>
* スキーマ定義ファイル: <https://petstore3.swagger.io/api/v3/openapi.json>

---

<div class="chapter">OpenAPI Generator</div>

### OpenAPI Generatorをインストール

<https://github.com/OpenAPITools/openapi-generator#1---installation>

インストール方法が多数用意されているので環境に合わせて利用してください

* :m: Maven Plugin
* :package: npm
* :beer: Homebrew
* :whale: Docker

---

<div class="chapter">OpenAPI Generator</div>

### Dockerを使って生成する

Mavenのプロジェクトに自動生成コードを追加する

````shell
$ cd <プロジェクトルート>
$ docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate
    -i https://petstore3.swagger.io/api/v3/openapi.json
    -g java -o /local/client

# デフォルトだと、src/main/java/org/openapitools/client にAPIクライアントやリクエスト、レスポンスの型が生成される 
$ ls src/main/java/org/openapitools/client
api    ApiCallback.java   ApiResponse.java             JSON.java                 
auth   ApiClient.java     Configuration.java           Pair.java                 
model  ApiException.java  GzipRequestInterceptor.java  ProgressRequestBody.java  
````

* `-i`: スキーマ定義ファイルパス(URL可)
* `-g`: どの言語、FWを対象にするか
* `-o`: 生成先ディレクトリ

---

<div class="chapter">OpenAPI Generator</div>

### 使い方

````java
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.api.PetApi;
import org.openapitools.client.model.Pet;

public class Repository {
    public Pet get() {
        // 内部的にはokhttp3を使っている。設定で変更可能。
        ApiClient apiClient = new ApiClient();
        PetApi petApi = new PetApi(apiClient);
        try {
            Pet petById = petApi.getPetById(1L);
            return petById;
        } catch (ApiException e) { e.printStackTrace(); }
    }
}
````

---

<div class="chapter">OpenAPI Generator</div>

### 生成対象言語・FW一覧

`-g` で指定できるgeneratorの一覧はこちら

<https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators.md>

generatorの設定値もこちらから

---

## TypeScriptの例

package.json

````json
{

  "scripts": {
    "openapi-generate": "rm -f client/*.ts && 
        TS_POST_PROCESS_FILE='yarn prettier --write'
        openapi-generator-cli generate 
        -i https://petstore3.swagger.io/api/v3/openapi.json
        -g typescript-axios 
        -o client 
        --additional-properties=disallowAdditionalPropertiesIfNotPresent=false,modelPropertyNaming=camelCase,supportsES6=true,useSingleRequestParameter=true
        --enable-post-process-file"
  }
  // ...
}
````

`yarn openapi-generate` で生成される

* `TS_POST_PROCESS_FILE='yarn prettier --write'`: 後処理を指定(ここではフォーマット)
* `--additional-properties=`: generator独自の設定

---

## メリット :+1:

* リクエスト、レスポンスの型に間違いがない
* APIの変更があったときに追従が簡単
* コンパイルエラーによって変更を検知できる

---

## デメリット :-1:

### プロジェクトのコード規約に合わないコードが生成される

* 許容する
* [generator](https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-axios.md) のオプションをよく読んで頑張る

### 途中から自動生成に変更するのは難しい(逆も然り)

* HTTPクライアントの実装も生成されるため、それに依存する
* 型定義のみ生成することもできるので、そちらのみ使用するようにする

---

<div class="chapter">デメリット</div>

### スキーマ定義を生成するライブラリの学習コスト

* ライブラリで複雑な定義を実現しようとするとハマる
  * ポリモーフィズムを表現しようとしたときに、oneOf/allOfが狙ったとおりに出力されず時間がかかった :tired_face:
* 定義ファイルを手動で作成し、サーバー・クライアント両方のコードを生成する方針に変えてみる(スキーマ駆動開発)
