---
title: Quartz v4アップデート
date: 2023-08-20T16:10:00+09:00
tags:
- 2023/08/20
---

[Obsidian](Obsidian.md) を [Quartzを使って公開](blog/Quartzを使ってObsidianを無料で公開してみた.md)  しており、
2023/08/20 にv4がリリースされたのでアップデートの調査をした

{{< card-link "https://quartz.jzhao.xyz" >}}

## 変更点

* [Hugo](note/Hugo.md) の利用を止めた
  * 結構破壊的な変更だ。なれない人にはカスタマイズしにくいってことで、まあフロントならTypeScriptのほうがいいよね
* hot reloadがいつでも行われるようになった
  * Hugoだと結構ホットリロードがされないことあったからね
* JSXでtemplating
* `configuration` と `plugin` の機構を導入した
  * Hugoに詳しくないとカスタマイズが難しかったよね

結構Hugoをカスタマイズしてしまっているので移行大変そうだな…

## 手順

https://quartz.jzhao.xyz/migrating-from-Quartz-3

[Quartzのリポジトリ](https://github.com/jackyzha0/quartz.git)をcloneして、ビルドする

````shell
git fetch
git checkout v4
git pull upstream v4
npm i
npx quartz create
````

本来、upstreamにQuartzのリポジトリを指定していて、
