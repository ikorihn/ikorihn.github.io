---
title: Quartz v4でObsidianを公開した
date: 2024-07-08T23:23:00+09:00
tags:
  - obsidian
  - Quartz
lastmod: '2024-07-08T23:23:52+09:00'
---

このサイトは当初は [[Quartzを使ってObsidianを無料で公開してみた|Quartz v3で構築]] していました。
2023-08-20 にv4がリリースされていて構成が大きく変わっているので、アップデート時に行ったことを記録します。

{{< card-link "https://quartz.jzhao.xyz" >}}

## v3からの変更点

- [[Hugo]] からPreactになった
    - Hugoのテンプレートに書き慣れていなかったので、JSXでフロントエンドのカスタマイズができるのは助かる
- 開発中のhot reloadが効くようになった
    - v3ではファイルを変更しても反映されないことが結構あったから助かる
- `configuration` と `plugin` の機構が導入された
    - UIのカスタマイズがしやすくなった

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

## カスタマイズ

[年ごとの記事一覧ページを作成](https://github.com/ikorihn/digitalgarden/commit/9c6392f6bd84edb48418b0429c4a2eb65c0b7cdf) したり、[リンクをカード形式で表示されるように](https://github.com/ikorihn/digitalgarden/commit/ed2025eb2cfa4b92625b95789816ac12fc1e4449) したり、その他細かい表示の変更などをしています。
その他修正内容は [Commits](https://github.com/ikorihn/digitalgarden/commits/v4/) を見てください。

## その他

Quartz v3で公開するときにWikilink形式でうまくリンクが貼られなかったので、Markdown linkに変換したがv4では改善されていました。
[[ObsidianのMarkdown linkをWikilinkに変換するCLI]] でWikilinkに戻しました。

## おわりに

v4でpreactになって、カスタマイズがしやすくなりました。
公開手順等のドキュメントも充実しているので、v3と比べるとハードルが低くなったように感じます。
vaultを公開してみたいけどObsidisn Publishは高いと感じる場合は十分ありな選択だと思います。