---
title: TailwindCSS
date: 2021-06-07T17:00:00+09:00
lastmod: 2021-10-10T23:51:09+09:00
tags:
- TailwindCSS
- css
- article
---

\#TailwindCSS #css

<https://tailwindcss.com/>

ユーティリティファーストでCSSクラスを組み合わせることでデザインする

 > 
 > “Best practices” don’t actually work.

伝統的な semantic class name(スタイル名ではなく、パーツの画面内での意味で名前をつけるみたいなこと) がベストプラクティスとされてきたが、実際にやってみるとメンテナンスを困難にしていることがわかる

[TailwindCSS入門 ~ Utility First + デザインシステムの構築 ~ - Qiita](https://qiita.com/oedkty/items/68461080515ec1012980) #article

* CSS Propertyに対応するクラス（e.g. `.flex`）
* 特定のブレークポイントや、疑似クラスに対応するクラス（e.g. `.sm:font-lg` `.hover:flex-row`）

が用意されていて、単一のクラスで様々なスタイルを表現でき記載量が大きく減る為、コードの可読性が上がります。

細かいデザインの調整はできないが、逆に言うとチームやコンポーネント間で揺れがなくなる

**意思決定コストを下げる** ことができる

カスタマイズも可能なので、デザインシステムの構築をできる。
