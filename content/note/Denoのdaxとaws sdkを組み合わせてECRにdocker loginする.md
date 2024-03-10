---
title: Denoのdaxとaws sdkを組み合わせてECRにdocker loginする
date: 2024-02-14T10:56:00+09:00
tags:
  - Deno
---

[[dax(Deno)]] を最近よく使っているのでメモ

[[Deno]] はnpmのモジュールを使えるので、aws-sdk-jsを普通にインポートすればよい。

## Docker loginする

[[AWS SDK for JavaScript v3 でassume-roleで各リソースにアクセスするクライアントを作る]] でクライアントを作ってECRのcredentialを取得する

```typescript title:aws.ts
export async function loginDocker(ecrClient: ecr.ECRClient) {
  const authorizationResponse = await ecrClient.send(
    new ecr.GetAuthorizationTokenCommand({}),
  );
  if (authorizationResponse.authorizationData == null) {
    return;
  }
  const authToken =
    authorizationResponse.authorizationData[0].authorizationToken;
  if (authToken == null) {
    return;
  }
  const textDecoder = new TextDecoder();
  const password =
    textDecoder.decode(base64.decodeBase64(authToken)).split(":")[1];
  await $`docker login --username AWS --password ${password} ${ACCOUNT_NTJ_TRIRL}.dkr.ecr.ap-northeast-1.amazonaws.com`;
}
```
