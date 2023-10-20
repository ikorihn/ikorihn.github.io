---
title: GASをTSで書けるようにする
date: 2021-06-06T15:26:00+09:00
lastmod: 2021-06-06T16:30:23+09:00
tags:
- GAS
- TypeScript
---

[clasp](note/clasp.md) を使うと、[GAS](note/GAS.md) をTypeScriptで書くことができる。
clasp 1.5.0 でサポートされるようになった。

<https://github.com/google/clasp/blob/master/docs/typescript.md>

ローカルでtsファイルで書いたGASをpushすると、自動でトランスパイルしてからアップロードしてくれる

### GASをTSで書けるようにする

claspのプロジェクトで、google-apps-scriptの型定義を追加

````shell
$ npm install -D @types/google-apps-script
````

これによって、IDE上でSpreadsheetAppなどGAS固有の定義も補完されるようになる

### tsconfig.jsonを追加する

`tsconfig.json`

````json
{
  "compilerOptions": {
    "lib": [
      "esnext"
    ],
    "target": "ES2019",
    "experimentalDecorators": true,
    "esModuleInterop": true
  }
}
````

### tsファイルを作ってpushする

`hello.ts`

````typescript
const greeter = (person: string) => {
    return `Hello, ${person}!`;
}

function testGreeter() {
    const user = 'Grant';
    Logger.log(greeter(user));
}
````

push

````shell
$ clasp push
````

プロジェクトを開く

````shell
$ clasp open
````

.gsファイルに変換されたファイルが作成されている

### 注意

* `clasp pull` すると、変換されたjsファイルがダウンロードされる
* 基本的にはローカルでTypeScriptで開発してpushするという一方通行になるので、複数人で開発するときにもそのフローを徹底する
* よくわからずにWeb上で編集する人がいると、大変なことになる(実体験)
