---
title: Vitest in-source testing
date: 2023-08-16T19:00:00+09:00
tags:
- 2023/08/16
- JavaScript
---

https://vitest.dev/guide/in-source.html

ソース内にテストを書くことができる。

## in-source testing と.test.jsを共存させるとin-sourceが動かない

`hello.ts` と `hello.test.ts` があるときに、`hello.ts` 内に書いたテストコードが実行されない。

````typescript
if (import.meta.vitest) {
    // テストコード
}
````

このとき `import.meta.vitest` がundefinedとなっていてブロック内に入っていなかった。
issue等が見つけられなかったので本当にそういう動きなのかわからないのだが、 `hello.test.ts` を消すと動作するようになったので、どちらかに寄せるしかなさそう。
