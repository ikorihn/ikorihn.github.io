---
title: lodashを使いたくないでござる
date: 2022-04-18T19:58:00+09:00
tags:
- JavaScript
lastmod: 2022-04-18T19:58:00+09:00
---

\#JavaScript

[lodash やめ方 - Qiita](https://qiita.com/mizchi/items/af17f45d5653b76f6751)

だいたいはES6標準の書き方で書けるようになっているが、どうしてもlodashの関数を使いたいときがある。
そんなときは https://github.com/angus-c/just/ を使ってみてもいいかもしれない。

[lodashの代わりにjustを使う](https://zenn.dev/terrierscript/articles/2020-11-26-lodash-just)

* パッケージは`just-***`という名前で単関数が独立している。必要なものだけ使える
* zero-dependencyな作り。
* 比較的簡素に作られているので自前実装に参考にしやすい

あるいは、lodash自身が個別にモジュール化してくれているのでそれをインストールしてもいいかも

例: https://www.npmjs.com/package/lodash.debounce

````shell
npm i 
````
