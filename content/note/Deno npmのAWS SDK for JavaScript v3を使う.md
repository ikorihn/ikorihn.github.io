---
title: Deno npmのAWS SDK for JavaScript v3を使う
date: "2023-08-18T15:26:00+09:00"
tags:
  - '2023/08/18'
  - TypeScript
  - Deno
---

Deno が[npmパッケージをサポート](https://deno.com/blog/v1.28)したことにより、[aws-sdk-js-v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) が利用できるようになっている。

```typescript
import { S3 } from "npm:@aws-sdk/client-s3@^3.363.0"";

const s3Client = new S3({
  region: "ap-northeast-1",
});

const objects = await s3Client.listObjectsV2({ Bucket: "sample" });
const contents = objects.Contents;
if (!contents) {
  console.log("bucket is empty");
  Deno.exit(1);
}
```
