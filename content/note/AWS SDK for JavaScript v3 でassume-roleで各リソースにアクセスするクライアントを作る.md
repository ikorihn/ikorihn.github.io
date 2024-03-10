---
title: AWS SDK for JavaScript v3 でassume-roleで各リソースにアクセスするクライアントを作る
date: 2024-02-27T18:45:00+09:00
tags:
  - AWS
  - TypeScript
---

## やりたいこと

アクセスキーなどで直接リソースにアクセスできない環境から、[[JavaScript]] で [[AWS]] のリソースを操作したい。
[[AWS CLI]] であればassume-roleを使うが、簡単なラッパーがないかを調べた[]()。

## やり方

aws-sdk-js には [credential-provider](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/) があり認証が簡単に行える。
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
