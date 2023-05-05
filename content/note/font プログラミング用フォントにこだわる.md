---
title: font プログラミング用フォントにこだわる
date: 2021-05-31T10:36:00+09:00
tags:
- font
---

## 絶対条件

* monospace
* 0とO、1とlとIなどが見分けやすい
* マルチバイト文字がくずれない

## おすすめフォント

* Cica
* HackGen

## 各ソフトに設定する

### Chrome

一括で設定する方法もあるが、サイトによっては見づらかったり、Web開発者だとフォントが変わってしまうのは嬉しくないので、おすすめはStylebotでサイトごとに設定

bitbucket

````css
body * {
    font-family: Cica;
}

/* ページ全体ではなくコード部分だけに適用したい場合
.code-diff {
    font-family: Cica;
    font-size: 14px;
}
.bitkit-diff-wrapper-diff .inline-content-wrapper {
    font-family: Cica;
    font-size: 14px;
}
*/
````

### Intellij IDEA

### Visual Studio Code
