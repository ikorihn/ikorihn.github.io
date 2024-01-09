---
title: openapi-generatorで生成したtypescript-fetchのクライアントにmiddlewareを設定する
date: 2023-12-18T09:55:00+09:00
tags:
- TypeScript
- OpenAPI
---

[OpenAPI Generator](note/OpenAPI%20Generator.md) の `typescript-fetch` で生成されたAPIのクライアントコードには `Middleware` の仕組みが備わっている。

型定義はこちらのようになっている

````typescript
export interface Middleware {
  pre?(context: RequestContext): Promise<FetchParams | void>
  post?(context: ResponseContext): Promise<Response | void>
  onError?(context: ErrorContext): Promise<Response | void>
}
````

この定義を満たすようなインスタンスをAPIクライアントのインスタンス生成時に渡してあげると、リクエスト実行前後やエラー時に実行される処理を挟むことができる。

````typescript
const middleware: Middleware = {
    pre: async (context: RequestContext) => {
        console.log("pre function")
        return {
            init: context.init,
            url: context.url
        }
    },
    post: async (context: ResponseContext) => {
        console.log("post function")
        return Promise.resolve(context.response)
    }
}

// コンストラクタに渡す
const user = await (new UserApi(new Configuration({ middleware: [middleware] })).getUser())
````

例えば、500エラーを受け取ったときに一回だけリトライするといったことを雑に実装するとこのようになるだろう。

````typescript
const middleware: Middleware = {
  post: async (context: ResponseContext) => {
    if (context.response.status >= 500) {
      const response = await fetch(context.url, context.init)
      return Promise.resolve(response)
    }
    return Promise.resolve(context.response)
  },
}
````
