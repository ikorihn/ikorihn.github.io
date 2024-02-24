---
title: Gatsbyjsに目次を追加する
date: "2021-05-03T11:11:00+09:00"
tags: ['Gatsbyjs']
---

各ページに目次を追加したい

## 前提条件

目次ボタンは`h`タグ内に`#`を使った「ページ内リンク」となるので

ページ内リンクを取り扱うプラグインとの併用がほぼ必須となっている。

私が合わせて使っているページ内リンクプラグインは次

[gatsby-remark-autolink-headers | GatsbyJS](https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/)

こちらの設置方法も記事にしてある。

[【Gatsby.js】見出しにページ内リンクを設定するプラグイン「gatsby-remark-autolink-headers」 | Blog](https://www.ultra-noob.com/blog/2020-08-14-%E3%80%90Gatsby_js%E3%80%91%E8%A6%8B%E5%87%BA%E3%81%97%E3%81%AB%E3%83%9A%E3%83%BC%E3%82%B8%E5%86%85%E3%83%AA%E3%83%B3%E3%82%AF%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E3%80%8Cgatsby-remark-autolink-headers%E3%80%8D/)

# [](https://www.ultra-noob.com/blog/2020/2020-08-15-%E3%80%90Gatsby_js%E3%80%91%E8%A8%98%E4%BA%8B%E3%81%AB%E3%80%8C%E7%9B%AE%E6%AC%A1%E3%80%8D%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E3%80%8Cgatsby-remark-table-of-contents%E3%80%8D%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9/#gatsby-remark-table-of-contents)

[gatsby-remark-autolink-headers](https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/)

## プラグインを追加

[gatsby-remark-table-of-contents](https://www.gatsbyjs.com/plugins/gatsby-remark-table-of-contents/)

```sh
yarn add gatsby-remark-table-of-contents
```
