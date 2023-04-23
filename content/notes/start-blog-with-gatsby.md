---
title: Gatsbyでブログを作ったので、構築ログを残す
date: "2021-10-10T19:00:00+09:00"
updated-date: "2021-10-10T19:00:00+09:00"
description: このブログはGatsby + Netlify で作成しています。備忘録も兼ねて、構築ログを残しておきます。
tags:
  - Gatsby
  - Netlify
---

## Gatsby.js について

<https://www.gatsbyjs.com/>

Reactでつくられた静的サイトジェネレータ

Reactをビルド時に1回だけ実行し、HTML,JSを生成する。
生成されたファイルをホスティングサービスにデプロイするだけで見られるようになる。

### GraphQL

* Gatsby.jsではビルド時のさまざまなデータをGraphQLで取得する。
* Markdown形式で書いた情報を、ファイルシステムから読み込んで、GraphQL経由で取得し、Reactコンポーネント内で表示する。
* GatsbyではMarkdownファイルに限らず、様々なデータを `data source`, `data transformer` という枠組みで一般化することで、多様な処理を統一的にかつ簡潔に記述することができている。
* クライアントはビルド時に形成されたGraphQL DBの全体は必要ないので、「クエリの結果」のみをJSONとして合わせてデプロイする。

## starterを使ってblogを作成

テンプレートを利用してブログを構築しました。

````shell
npx gatsby new gatsby-starter https://github.com/gatsbyjs/gatsby-starter-blog
````

※最初、[Leonids](https://www.gatsbyjs.com/starters/renyuanz/leonids/) で構築しましたがいまいち気に入らなかったので、[gatsby-starter-blog](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-blog) で作り直しました。
作り直すにあたっては、別ディレクトリでstarterから作成 → ファイル一式をコピー → TypeScriptへの変換等で地道に行いました。

## TypeScript化する

tsxに変更
GraphQLのクエリ結果を型解決する

## TailwindCSS

TailwindCSSのユーティリティを組み合わせる思想が好きでよく使用するので、本ブログでも
<https://www.gatsbyjs.com/docs/how-to/styling/tailwind-css/>
に沿って設定していきます。

### インストール、初期設定

````shell
yarn add -D tailwindcss@npm:@tailwindcss/postcss7-compat autoprefixer
npx tailwindcss init
````

### PostCSSで適用する

````shell
yarn add postcss gatsby-plugin-postcss
````

````javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
````

````javascript:title=postcss.config.js
module.exports = () => ({
  plugins: [require("tailwindcss")],
})
````

### base CSSを追加する

`@tailwind` ディレクティブを使用してTailwindの `base`, `components`, `utilities` をCSSに挿入します。

````css:title=src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
````

カスタムCSSにTailwindのクラスを適用したい場合以下のように書ける

````css:title=src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import popup.css body {
  @apply bg-purple-200;
}
````

`gatsby-browser.js` で読み込む

````javascript:title=gatsby-browser.js
import "./src/index.css"
````

### Purge を設定する

デフォルトではTailwindCSS全体がビルドに含まれるため、ファイルサイズ削減のために必要なclassのみにpurgeする。

````javascript:title=tailwind.config.js
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {},
  variants: {},
  plugins: [],
}
````

## TOCを追加

[gatsby-remark-autolink-headers](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/) で見出しにアンカーがつくようにする

````shell
yarn add gatsby-remark-autolink-headers
````

````javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 80,
              icon: false,
              maintainCase: false,
            },
          },
        ],
      },
    },
  ],
}
````

### TOCコンポーネントを作成してページのコンポーネントに追加

````typescript:toc.tsx
import * as React from 'react'

type Props = {
  tocHtml?: string
}
const Toc: React.FC<Props> = ({tocHtml}) => {
  if (tocHtml === undefined) {
    return <></>
  }
  return (
    <div className="toc bg-code-block px-4 py-1 my-2">
      <h4 className="toc__title mt-2">目次</h4>
      <div
        className="toc__content"
        dangerouslySetInnerHTML={{
          __html: tocHtml,
        }}
      />
    </div>
  )
}

export default Toc
````

````typescript:bolg-post.tsx
// ....
  return (
    <Layout location={location} title={siteTitle}>

      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{post.frontmatter.date}</p>
        </header>
        <section
          className="blog-post__description"
        >
          {post.frontmatter.description}
        </section>
        <Toc
          tocHtml={post.tableOfContents}
        />
// ...
    </Layout>
  )
````

## コードブロックにタイトルを設定

参考: [Gatsbyにシンタックスハイライトを入れてコードをきれいに表示する | littlebylittle](https://littlebylittle.work/2020/01/gatsby-syntax-highlighting/)

[gatsby-remark-code-titles](https://www.gatsbyjs.com/plugins/gatsby-remark-code-titles/) を使って、コードブロックにタイトルをつけます

````shell
yarn add gatsby-remark-code-titles
````

````javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          'gatsby-remark-code-titles',
          `gatsby-remark-prismjs`,
        ],
      },
    },
  ],
}
````

コードタイトル用のスタイルを追加

````css:title=index.css
.gatsby-code-title {
  @apply bg-code-block text-text-light;
  margin-bottom: -0.6rem;
  padding: 6px 12px;
  font-size: 0.8em;
  line-height: 1;
  font-weight: bold;
  display: table;
  border-radius: 4px 4px 0 0;
}
````
