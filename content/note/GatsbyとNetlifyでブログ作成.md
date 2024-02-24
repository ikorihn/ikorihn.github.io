---
title: GatsbyとNetlifyでブログ作成
date: "2021-05-02T20:25:00+09:00"
tags: ['Gatsbyjs', 'blog']
---

Gatsby.jsとNetlifyでブログを作成して公開する手順

##  Netlify

Netlify、GitHubリポジトリを設定する

[[NetlifyとGitHubで静的サイトを公開する]]

## Gatsby.js

[[Gatsby.js]]

### CLIインストール

```sh
npm install -g gatsby-cli
```

### プロジェクト作成

`gatsby new <名前> <スターター>` で作成できる。

```sh
gatsby new ikorihn-blog https://github.com/renyuanz/leonids
```

スターターは [leonids](https://www.gatsbyjs.com/starters/renyuanz/leonids) を使用した。

- シンプル、固定のサイドバー
- TailwindCSSを使用
- Light/Darkモード
- GitHub actionsでGitHub pagesにデプロイ

### 動作確認

```sh
cd ikorihn-blog
gatsby develop
```

`http://localhost:8000/` を開く
