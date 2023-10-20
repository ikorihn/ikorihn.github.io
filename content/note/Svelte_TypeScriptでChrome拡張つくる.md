---
title: Svelte_TypeScriptでChrome拡張つくる
date: 2022-01-04T23:37:00+09:00
tags:
- TypeScript
- Svelte
---

[Svelte、TailwindCSS、Jest、およびRollupで構築されたChrome拡張ボイラープレート。 - wenyanet](https://www.wenyanet.com/opensource/ja/60d5f6d8af19fb6732538fb0.html)
[Svelte + TypeScriptで chrome拡張を作る](https://speakerdeck.com/mukai21/svelte-plus-typescriptde-chromekuo-zhang-wozuo-ru)

1. https://github.com/kyrelldixon/svelte-tailwind-extension-boilerplate から生成する

````shell
$ npx degit "kyrelldixon/svelte-tailwind-extension-boilerplate#main" chrome-copy-url-and-title
$ cd chrome-copy-url-and-title
$ yarn
# TypeScriptに変換
$ node scripts/setupTypeScript.js
$ yarn
````

2. `yarn dev` してdistにできる成果物をchromeで読み込む

chrome拡張の管理ページを開いて、開発者モードをONにし、Load Unpacked を押して読みこむ
