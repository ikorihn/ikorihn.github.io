---
title: openapi-generatorで生成したtypescript-fetchの通信部をカスタマイズする
date: 2024-01-06T15:15:00+09:00
tags:
- TypeScript
- OpenAPI
---

[OpenAPI Generator](note/OpenAPI%20Generator.md) の `typescript-fetch` で生成されたAPIのクライアントコードには `Middleware` の仕組みや、`fetch` のラッパーをインジェクトする仕組みが備わっている

Middlwareの設定はこちら -> [openapi-generatorで生成したtypescript-fetchのクライアントにmiddlewareを設定する](note/openapi-generatorで生成したtypescript-fetchのクライアントにmiddlewareを設定する.md)

ラッパーの型定義はこちらのようになっている

````typescript
export type FetchAPI = WindowOrWorkerGlobalScope['fetch']
````

たとえば次のように、Unauthorizedのときに再認証してリトライするといった処理を書いたりできる。

````typescript
const fetchRetry = (): FetchAPI => {
  return async (input, init) => {
    let response: Response | undefined = undefined
    try {
      response = await fetch(input, init)
    } catch (e) {
      if (response === undefined) {
        if (e instanceof Error) {
          throw new FetchError(
            e,
            'The request failed and the interceptors did not return an alternative response'
          )
        } else {
          throw e
        }
      }
    }

    if (response.ok) {
      return response
    }

    if (response.status === 401) {
      // トークン再取得
      const authResponse = await authorization()
      if (authResponse === 'failure') {
        throw showError({ statusCode: 500, fatal: true })
      }

      try {
        response = await fetch(input, {
          ...init,
          headers: {
            Authorization: `Bearer ${authResponse.token}`,
          },
        })
      } catch (e) {
        if (response === undefined) {
          throw e
        }
      }
    }
    return response
  }
}

const client = new MyApi(
  new Configuration({
    fetchApi: fetchRetry(),
    basePath: apiUrl,
    headers: { Authorization: `Bearer ${token}` },
  })
)
````
