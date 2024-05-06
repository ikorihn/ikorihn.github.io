---
title: GatsbyjsのTypeScript化
date: "2021-05-02T21:53:00+09:00"
tags: ['Gatsbyjs', 'TypeScript']
---

[[Gatsby.js]] を [[TypeScript]] 化する

## tsconfig.jsonを追加

tsconfig.json

```json
```


## GraphQL Schema, リクエストの型生成

Gatsby はリソースに対して GraphQL でリクエストを送りデータを取得する
GraphQL リクエストのレスポンスの型を、[gatsby-plugin-typegen](https://github.com/cometkim/gatsby-plugin-typegen) を使い生成する。

```bash
yarn add gatsby-plugin-typegen
```

`gatsby-config.js`の plugins に`gatsby-plugin-typegen`を追記する。

src/components/index.ts

```js
module.exports = {
  siteMetadata: {
    // ...
  },
  plugins: [
    // ...
    `gatsby-plugin-typegen`
  ],
}
```


次に、各コンポーネントの query にクエリ名を追加していきます。  
この変更をすることでそのクエリ専用の型が生成されます。

（例： src/components/index.js `query BlogIndex`の部分を追記している）

[🔗 src/components/index.ts](https://github.com/kawamataryo/gatsby-typescript-sample/blob/master/src/src/components/index.ts)

```js
//...
export const pageQuery = graphql`
  query BlogIndex {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
```

最後に`yarn build`を実行すると、`src/__generated__/gatsby-types.ts`が生成されているはずです。  
ここに GraphQL リクエストの型定義があります。  
先ほど追加した BlogIndex クエリの型を見てみると、、

[🔗 src/pages/index.ts](https://github.com/kawamataryo/gatsby-typescript-sample/blob/master/src/src/__generated__/gatsby-types.ts)

```ts
//...
type BlogIndexQueryVariables = Exact<{ [key: string]: never; }>;


type BlogIndexQuery = { readonly site: Maybe<{ readonly siteMetadata: Maybe<Pick<SiteSiteMetadata, 'title'>> }>, readonly allMarkdownRemark: { readonly nodes: ReadonlyArray<(
      Pick<MarkdownRemark, 'excerpt'>
      & { readonly fields: Maybe<Pick<Fields, 'slug'>>, readonly frontmatter: Maybe<Pick<Frontmatter, 'date' | 'title' | 'description'>> }
    )> } };
//...
```

ちゃんと生成されてますね！　最高便利。

## 各コンポーネントファイルのTypeScript化

これで準備ができたので、各ファイルを TypeScript 化していきます。  
[gatsby-plugin-typescript](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-typescript)の追加から入る記事が多いのですが、2020 年 10 月現在、Gatsby には`gatsby-plugin-typescript`がすでに組み込まれているので、何もせずで大丈夫です。

何か TypeScript のビルド関連で追加の設定をしたい場合は、gatsby-config.js の plugins で`gatsby-plugin-typescript`を追加して、option を設定してください。

各コンポーネントのファイル拡張子を`.js`から`.tsx`に書き換えましょう。  
そして、StaticQuery の戻り値など型エラーとなっている箇所に型をつけていきます。

例えば、`src/pages/index.ts`の型付けは以下のようになります。

[🔗 src/pages/index.ts](https://github.com/kawamataryo/gatsby-typescript-sample/blob/master/src/pages/index.ts)

```ts
import React from "react"
import { Link, graphql } from "gatsby"
import { PageProps } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

const BlogIndex:React.FC<PageProps<GatsbyTypes.BlogIndexQuery>> = ({ data, location }) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  // ... 以下略
}
```

ポイントは以下のように`React.FC`、`PageProps`などのジェネリクス型を使うことと、`gatsby-plugin-typegen`で生成した型を使うことです。

```ts
const BlogIndex:React.FC<PageProps<GatsbyTypes.BlogIndexQuery>> = ({ data, location }) => { /* -- */ }
```

これで`data`の型が`BlogIndexQuery`の型で推論されます。  
あとは、適宜 Optional Chaining や、Non null Assertion を使って型エラーを解決しましょう。

# [](https://zenn.dev/ryo_kawamata/articles/gatsby-ts-2020#4.-gatsby-node.js%E3%81%AEtypescript%E5%8C%96)4\. gatsby-Node.jsのTypeScript化

`gatsby-node.js`でも TypeScrip で書けるようにしていきます。ここでは[ts-node](https://github.com/TypeStrong/ts-node)を追加ます。

ここの書き方は[@Takepepe](https://twitter.com/takepepe?lang=en)さんの以下の記事を参考にさせていただきました。良記事ありがとうございます🙏  
[Gatsby.js を完全TypeScript化する - Qiita](https://qiita.com/Takepepe/items/144209f860fbe4d5e9bb)

```
yarn add -D ts-node
```

そして、`gatsby-config.js`を以下のように変更します。

[🔗 gatsby-config.js](https://github.com/kawamataryo/gatsby-typescript-sample/blob/master/gatsby-config.js)

```js
"use strict"

require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    target: "esnext",
  },
})

require("./src/__generated__/gatsby-types")

const {
  createPages,
  onCreateNode,
  createSchemaCustomization,
} = require("./src/gatsby-node/index")

exports.createPages = createPages
exports.onCreateNode = onCreateNode
exports.createSchemaCustomization = createSchemaCustomization
```

そして、今まで`gatsby-node.js`に記述していた内容を`src/gatsby-node/index.ts`に移動して、型を設定します。  
基本的に node の API は`GatsbyNode`から型を取得できます。

本当は、`allMarkdownRemark`のクエリ部分の方も`gatsby-plugin-typegen`で生成したかったのですが、上手く認識してくれませでした。やり方わかる方いたら教えてください🙏  
（ドキュメントの `Provides utility types for gatsby-node.js.`はまだチェックがついていないので、まだ未対応なのかな？）。

[🔗 src/gatsb-node/index.ts](https://github.com/kawamataryo/gatsby-typescript-sample/blob/master/src/gatsby-node/index.ts)

```ts
import path from "path"
import { GatsbyNode, Actions } from "gatsby"
import { createFilePath } from "gatsby-source-filesystem"

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)

  const result = await graphql<{ allMarkdownRemark: Pick<GatsbyTypes.Query["allMarkdownRemark"], 'nodes'> }>(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    `
  )

  //...

  }
}

export const onCreateNode: GatsbyNode["onCreateNode"] = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  //...
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = async ({ actions }: { actions: Actions}) => {
  const { createTypes } = actions
  // ...
}

```

これで`gatsby-Node.js`の TypeScript 化も完了です🎉

## 参考

- [Gatsby.jsのTypeScript化 2020](https://zenn.dev/ryo_kawamata/articles/gatsby-ts-2020)
- [Gatsby.js を完全TypeScript化する - Qiita](https://qiita.com/Takepepe/items/144209f860fbe4d5e9bb)

