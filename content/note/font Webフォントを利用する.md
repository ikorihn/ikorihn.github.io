---
title: font Webフォントを利用する
date: 2021-05-28T18:12:00+09:00
tags:
- font
---

<https://lpeg.info/webworks/google_fonts.html>

## フォントを利用する

[Noto Sans JP](note/Noto%20Sans%20JP.md) を使いたい。

Noto Sans系の違いは

* [【WEBフォント】Noto Sans系日本語フォントは結局どれを使えばいいのか検証してみる | oku-log](https://oku-log.com/blog/noto-sans/)
* [とりあえずNoto Sans。は、やめませんか？という話｜トモノ｜Web Designer｜note](https://note.com/minamotono/n/n765d41581136)

fonts.google.comでfontを選択

<https://fonts.google.com/specimen/Noto+Sans+JP>

使用する太さの `Select this style` をクリック

`Use on the web` で使いかたを選択して、コピー

````html
<link rel="preconnect" href="https://fonts.gstatic.com">  
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100&display=swap" rel="stylesheet">
````

フォントを指定

````css
font-family: 'Noto Sans JP', sans-serif;
````
