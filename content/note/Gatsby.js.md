---
title: Gatsby.js
date: 2021-05-02T20:35:00+09:00
tags:
- Gatsbyjs
---

Reactの静的サイトジェネレータ

https://www.gatsbyjs.com/

## 動作

Reactアプリをビルド時に1回実行し、HTML,JSを生成する。
生成されたファイルをホスティングサービスにデプロイするだけで見られるようになる

## ビルド時GraphQL

Gatsby.jsではビルド時のさまざまなデータをGraphQLで取得する。

Markdown形式のテキスト情報を、ファイルシステムから読み込んで、GraphQL経由で取得し、Reactコンポーネント内で表示する。
GatsbyではMarkdownに限らず様々なデータを、 `data source`, `data transformer` という枠組みで一般化することで、多様な処理を統一的にかつ簡潔に記述することができている。

クライアントはビルド時に形成されたGraphQL DBの全体は必要ないので、「クエリの結果」のみをJSONとして合わせてデプロイする。

## プラグイン

データを作成するために、 [data transformer](https://www.gatsbyjs.org/plugins/?=tranformer), [data source](https://www.gatsbyjs.org/plugins/?=source)がプラグインとして利用できる。
