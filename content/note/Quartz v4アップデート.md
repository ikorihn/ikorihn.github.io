---
title: Quartz v4アップデート
date: "2023-08-20T16:10:00+09:00"
tags: 
    - '2023/08/20'
---

このサイトは [[Obsidian]] を [[Quartzを使ってObsidianを無料で公開してみた|Quartzを使って公開]]  しており、構築当初はv3だった。
2023-08-20 にv4がリリースされたのでアップデートしてみた

{{< card-link "https://quartz.jzhao.xyz" >}}

## 変更点

- [[Hugo]] の利用を止めた
    - 結構破壊的な変更だ。なれない人にはカスタマイズしにくいってことで、まあフロントならTypeScriptのほうがいいよね
    - preactとremarkを使っているみたい。
- hot reloadがいつでも行われるようになった
    - Hugoだと結構ホットリロードがされないことあったからね
- JSXでtemplating
- `configuration` と `plugin` の機構を導入した
    - Hugoに詳しくないとページの変更が難しかったよね
    - 結局tsxが書けないとカスタマイズできないんだけど、goのテンプレートよりはましかな
    - 自分は結構カスタマイズしてしまっているので移行大変そうだな…

## 手順

https://quartz.jzhao.xyz/migrating-from-Quartz-3

[Quartzのリポジトリ](https://github.com/jackyzha0/quartz.git)をcloneして、ビルドする

```shell
git fetch
git checkout v4
git pull upstream v4
npm i
npx quartz create
```

`content` 以外のファイルをすべて置き換える


