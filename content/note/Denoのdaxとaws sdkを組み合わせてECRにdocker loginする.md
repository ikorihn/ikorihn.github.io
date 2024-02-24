---
title: Denoのdaxとaws sdkを組み合わせてECRにdocker loginする
date: 2024-02-14T10:56:00+09:00
tags:
  - Deno
---

[[dax(Deno)]] を最近よく使っているのでメモ

[[Deno]] はnpmのモジュールを使えるので、aws-sdk-jsを普通にインポートすればよい。

## assume-roleで各リソースにアクセスするクライアントを作る

アクセスキーなどで直接リソースにアクセスできない環境なので、assume-roleを使う。
aws-sdk-js には[credential-provider](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/) があり認証が簡単に行える。
`sts:AssumeRole` するには `fromTemporaryCredentials` で、他にもEC2インスタンスメタデータを使う `fromInstanceMetadata` や、[[AWS Lambda|Lambda]] 実行時に自動でセットされる `AWS_ACCESS_KEY_ID` などを使う `fromEnv` といったものもある。

```typescript title:deps.ts
export * as ecr from "npm:@aws-sdk/client-ecr@3.511.0";
export { fromTemporaryCredentials } from "npm:@aws-sdk/credential-providers@3.511.0";
```

```typescript title:aws.ts
import { ecr, fromTemporaryCredentials } from "./deps.ts";

function getStsCredentialProvider(
  account: string,
  region: string,
  role: string,
  sessionName: string,
) {
  return fromTemporaryCredentials({
    params: {
      RoleArn: `arn:aws:iam::${account}:role/${role}`,
      RoleSessionName: sessionName,
      DurationSeconds: 600,
    },
    clientConfig: {
      region,
    },
  });
}

export function createClients(
  account: string,
  region: string,
  role: string,
  sessionName: string,
) {
  const credProvider = getStsCredentialProvider(
    account,
    region,
    role,
    sessionName,
  );
  const ecrClient = new ecr.ECRClient({
    region,
    credentials: credProvider,
  });

  return {
    ecrClient,
  };
}
```

## Docker loginする

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
