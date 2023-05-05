---
title: GASをclaspで作ってV8ランタイムに対応させる
date: 2021-06-06T16:29:00+09:00
lastmod: 2021-06-06T17:23:20+09:00
tags:
- GAS
- TypeScript
---

<https://qiita.com/r57ty7/items/77ea0a3dc5c2200b6f1d>

[GAS](note/GAS.md) でV8ランタイムが利用できるようになった。

claspで管理しているGASのプロジェクトをV8に対応させたい。

`tsconfig.json`

````json
{
    // ...
    "compilerOptions": {
        "target": "ES2019"
    }
}
````

`appsscript.json`

````json
{
    // ...
    "runtimeVersion": "V8"
}
````
