---
title: Obsidian calloutをカスタマイズする
date: 2024-03-10T19:03:00+09:00
tags:
  - obsidian
---

https://help.obsidian.md/Editing+and+formatting/Callouts
で紹介されている

アイコンは  [Lucide](https://lucide.dev) から探す

```css
.callout[data-callout="cardlink"] {
    --callout-color: 255, 255, 0;
    --callout-icon: link;
}
```

こんなcssを `.obsidian/snippets/xxx.css` に作り、
設定 > Appearance > CSS Snippets で有効にする