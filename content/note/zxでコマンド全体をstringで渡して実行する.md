---
title: zxでコマンド全体をstringで渡して実行する
date: 2024-03-21T15:30:00+09:00
tags:
  - TypeScript
---

[[google zx]] を使っていて、コマンドをstringで組み立ててshellで実行しようとしたらうまくいかなかった。

```typescript
const cmd = 'echo "Hello"'
await $`${cmd}`
// this is not work with following:
// bash: line 1: echo 'Hello': command not found
// node_modules/zx/build/core.js:146
//             let output = new ProcessOutput(code, signal, stdout, stderr, combined, message);
//                          ^
```

[Passing commands from string · Issue #224 · google/zx](https://github.com/google/zx/issues/224)
[Quotes | google/zx](https://google.github.io/zx/quotes)

stringをそのまま渡してしまうとquoteされてしまい、文字列全体が一つのコマンドとして認識されているらしい。

## 解決策1 スペースで分割する

スペースで分割した配列としてコマンドを渡すことで実行されるようになる。

```typescript
const cmd = "echo 'Hello'";
const { exitCode, stdout, stderr } = await $`${cmd.split(" ")}`;
```

```shell
❯ npx tsx tmp.ts
$ echo $'\'Hello\''
'Hello'
stdout 'Hello'
```

### 依然として残る問題

shell scriptの引数に空白が含まれている場合に、上記では期待通りにならない。

```shell
echo hello > 'Hello world'
```

```typescript
const cmd = "cat 'Hello world'";
const { exitCode, stdout, stderr } = await $`${cmd.split(" ")}`;
```

```
$ cat $'\'Hello' $'world\''
cat: "'Hello": No such file or directory
cat: "world'": No such file or directory
```

スペースではなくなにか別の文字列で区切って組み立てるなどで無理やり対応できるかもしれないが、あまりきれいではないのでどうしたものか。そこで次の解決策にする

## 解決策2 配列として渡す


```typescript
const cmd = ["cat", "Hello world"];
const { exitCode, stdout, stderr } = await $`${cmd}`;
```

```shell
$ cat $'Hello world'
hello
```

shell scriptのコマンド `cat "Hello world"` をそのままコピペはできなくなり、配列に書き直す手間は発生するが、これであれば確実である。

これを応用して、アクセスキーを環境変数にセットしながらコマンドを実行する [[AWS CLI]] のラッパーが作れる。
```typescript
import { $ } from "zx";
import type { AwsCredentialIdentity } from "@smithy/types";

export const awsCli = async (cred: AwsCredentialIdentity, script: ReadonlyArray<string>) => {
  return await $`AWS_SESSION_TOKEN=${cred.sessionToken} \
      AWS_ACCESS_KEY_ID=${cred.accessKeyId} \
      AWS_SECRET_ACCESS_KEY=${cred.secretAccessKey} \
      ${script}`;
};

await awsCli(
  {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN,
  },
  ["aws", "sts", "get-caller-identity"],
);
```

