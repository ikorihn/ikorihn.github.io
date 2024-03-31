---
title: google zx
date: 2023-11-09T15:43:00+09:00
tags:
  - TypeScript
  - JavaScript
draft: "true"
---

{{< card-link "https://google.github.io/zx/" >}}

[google/zx](https://github.com/google/zx)は、[[JavaScript]] や [[TypeScript]] で[[shell script]]を記述、実行することのできるライブラリです。

shell scriptはエラーハンドリングや制御構文の書き方にクセがあり、私が仕様を知らなかったことで発生させたバグは数しれず。
エディタで補完があまり効かないのも辛いところです。
そこでzxを使うことで、補完を効かせながら安全に開発を行うことができるようになります。

以下は zx 7.2.3 時点での情報となります。

## 使い方

`main.js`

```typescript
await $`ls -al`
const branch = 'main'
await $`git log ${branch}`
```


```shell
$ npx zx main.js
```

## TypeScriptで書いたスクリプトを実行する

```shell
$ zx main.ts
```

単純にこれでは実行できないので、トランスパイルして上げる必要がある。

```shell
## ts-node経由で実行する
$ node --loader ts-node/esm main.ts
## あるいはtsx
$ npx tsx main.ts
```

個人的にはtsxのほうが早いのでこっちを使っている。

shebangを書いておいて、実行ファイルとして実行するのもよい。

```typescript
#!/usr/bin/env -S node_modules/.bin/tsx

import { $ } from "zx";
await $`echo Hello`;
```

```shell
$ chmod +x main.ts
$ ./main.ts
# $ echo Hello
# Hello
```

## 参考

- [zxの紹介 〜 さよならシェルスクリプト そして伝説へ｜Offers Tech Blog](https://zenn.dev/overflow_offers/articles/20220606-zx-introduction)
- [Google発のJavaScriptで書けるシェル 「zx」 | DevelopersIO](https://dev.classmethod.jp/articles/shell-zx/)
- [google/zx を使って辛みの少ないスクリプトを書きたい | t28.dev](https://t28.dev/blog/write-script-using-zx/)