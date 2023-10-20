---
title: Nuxt Bridgeでtailwindcssを使う
date: 2022-03-16T22:39:00+09:00
tags:
- Nuxtjs
lastmod: 2022-03-16T22:39:00+09:00
---

\#Nuxtjs

Nuxt2を使っているプロジェクトに、[Nuxt Bridge](note/Nuxt%20Bridge.md) をインストールすると [TailwindCSS](note/TailwindCSS.md) がうまく動かなかったのでメモを残します。

## Nuxt 2に `@nuxtjs/tailwindcss` を入れる

[こちら](https://tailwindcss.com/docs/guides/nuxtjs)でpostcss、autoprefixerなどを自分で入れてもいいですが、楽をするためnuxtjsのモジュールを使いました。

https://tailwindcss.nuxtjs.org

````shell
$ npm install -D @nuxtjs/tailwindcss
$ npx tailwindcss init
$ cat tailwind.config.js
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

````css:assets/css/tailwind.css
@tailwind base;
@tailwind components;
@tailwind utilities;
````

````js:nuxt.config.js
   buildModules: [
     '@nuxt/typescript-build',
+    '@nuxtjs/tailwindcss',
   ],
````

## [Nuxt Bridge](note/Nuxt%20Bridge.md) にアップデートする

基本は https://v3.nuxtjs.org/getting-started/bridge/ に沿って行います。適宜yarnに読み替えてください。

`package.json` を書き換えて `nuxt-edge` に上げて、lockファイルを消したあと `npm install` を実行する

````json:package.json
- "nuxt": "^2.15.0"
+ "nuxt-edge": "latest"
````

[Nuxt Bridge](note/Nuxt%20Bridge.md) をインストールする

````shell
$ npm install -D @nuxt/bridge@npm:@nuxt/bridge-edge
````

npm scriptをNuxt CLIのコマンド `nuxi`  に書き換える

````json:package.json
{
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "start": "nuxi preview"
  }
}
````

次に `nuxt.config` を書き換えるよう指示されていますが、こちらを行ったところ `npm run dev` 実行時に次のようなエラーで起動しなくなりました。

https://github.com/nuxt/framework/issues/1697

````
[worker] Named export 'isWindows' not found. The requested module 'std-env' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:
````

 > 
 > Please make sure to avoid any CommonJS syntax such as `module.exports`, `require` or `require.resolve` in your config file. It will soon be deprecated and unsupported.

とありますが、一旦こちらは行わないこととします。 `export default` でも同様だったため、CommonJSに書き換えます。

````js:nuxt.config.js
module.exports = {
    // ...
}
````

### `tsconfig.json` に追加

````json:tsconfig.json
{
+ "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    ...
  }
}
````

### 互換性のない、廃止されたモジュールを削除する

以下を削除、移行するよう指示されています。

* @nuxt/content (1.x)
* nuxt-vite
* @nuxt/typescript-build
* @nuxt/typescript-runtime and nuxt-ts
* @nuxt/nitro
* @vue/composition-api
* @nuxtjs/composition-api 

````js:nuxt.config.js
   buildModules: [
-    '@nuxt/typescript-build',
     '@nuxtjs/tailwindcss',
],
````

### 起動！…しない

ここまでで一通り移行手順は踏めたので、一度 `npm run dev` します。

`require() of ES Module [...] is not supported` のようなエラーがでて起動しませんでした。

### 'std-env' is a CommonJS module

````
 WARN  [worker] Named export 'isWindows' not found. The requested module 'std-env' is a CommonJS module, which may not support all module.exports as named exports.  12:18:27
CommonJS modules can always be imported via the default export, for example using:

import pkg from 'std-env';
const { provider, isWindows } = pkg;


  import { provider, isWindows } from 'std-env';
  ^^^^^^^^^
  SyntaxError: Named export 'isWindows' not found. The requested module 'std-env' is a CommonJS module, which may not support all module.exports as named exports.
  CommonJS modules can always be imported via the default export, for example using:

  import pkg from 'std-env';
  const { provider, isWindows } = pkg;
````

https://github.com/nuxt/framework/issues/2026

### node-fetchをダウングレードする

https://stackoverflow.com/questions/70541068/instead-change-the-require-of-index-js-to-a-dynamic-import-which-is-available

v3に上がったことでCommonJSの記法が使えなくなった。
あえてv2を入れます。

````shell
$ npm i node-fetch@2
````

## 所感

ビルドが30秒くらいかかるようになりました。
Nuxt3だと5秒くらいだから遅く感じるけどまあ今までと比べると早いです
