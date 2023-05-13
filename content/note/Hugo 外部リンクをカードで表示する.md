---
title: Hugo 外部リンクをカードで表示する
date: 2023-05-07T16:19:00+09:00
tags:
- 2023/05/07
- Hugo
- Go
---

[resources.GetRemote](https://gohugo.io/hugo-pipes/introduction/#get-resource-with-resourcesget-and-resourcesgetremote) を利用することで、ビルドのタイミングで指定したURLへアクセスしてリソースを取得できる。

[v0.91.0](https://github.com/gohugoio/hugo/releases/tag/v0.91.0) で入った機能

## 使い方

### 外部リソースを取得

````go-html-template
{{ $remote := resources.GetRemote "https://www.example.com/styles.scss" }}
````

## カード型のリンクを作る

[Hugoでついに外部URLのブログカードを作れるようになった【自作ショートコード】 | Hugoブログテーマ「Salt」](https://hugo-theme-salt.okdyy75.com/article/salt/blog-card/)
