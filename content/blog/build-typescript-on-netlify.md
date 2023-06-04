---
title: TypeScriptのGatsbyをNetlifyでビルドしたときのエラーに対応した
date: 2021-10-31T19:00:00+09:00
updated-date: 2021-10-31T19:00:00+09:00
description: TypeScript化したGatsbyをNetlifyでビルドしたときに発生したエラーへの対応について
tags:
- Gatsbyjs
- frontend
---

## 事象

TypeScript化したGatsbyをNetlifyでビルドした際に以下のエラーが発生しました。

````shell
$ gatsby build
error Error in "/opt/build/repo/gatsby-node.js": Unexpected token '.'


  Error: /opt/build/repo/src/gatsby-node/index.ts:28
      const posts = result.data?.allMarkdownRemark.nodes;
                                ^
  SyntaxError: Unexpected token '.'
````

## 対応

Netlifyのビルドログに `Now using node v12.18.0 (npm v6.14.4)` とあるようにデフォルトではv12.18.0が使われるようです。
Optional ChainingはNode.js v14から使用できる機能のため、v14以上が使用されるように設定します。

[Manage build dependencies | Netlify Docs](https://docs.netlify.com/configure-builds/manage-dependencies/)

環境変数 `NODE_VERSION` で指定できるため以下のように設定しました。

![2021-10-31-17-31-50](blog/2021-10-31-17-31-50.png)

これでビルドが通るようになりました。
