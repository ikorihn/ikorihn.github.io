---
title: Chrome DevToolsで一度手動で要素をinspectするまでgetElementById等で要素が取得できなかった
date: 2023-09-15T14:59:00+09:00
tags:
  - JavaScript
lastmod: '2023-09-15T15:00:02+09:00'
---

## 問題

とあるページを開いて、DevToolsを開いてコンソールで `getElementById` を実行したが、取得することができなかった。
一度inspectorで要素を選択してから再実行すると取得できるようになる。

## 答え
 
[javascript - Can't get element in Chrome Dev Tools unless I inspect it manually - Stack Overflow](https://stackoverflow.com/questions/40428105/cant-get-element-in-chrome-dev-tools-unless-i-inspect-it-manually)

ページが iframe を使っているためだった。
DevTools上部の `top ▼`  となっている部分を開くとframeの一覧が出て、操作したいframeを選択してから `getElementById` をすると取得することができた

![[note/Pasted-image-20230915060936.png|]]
