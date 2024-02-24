---
title: bash-libが便利
date: 2023-11-21T09:30:00+09:00
tags:
  - shell
---

{{< card-link "https://github.com/cyberark/bash-lib" >}}

[[shell script]]で利用できるユーティリティ集のリポジトリがあった。

Git操作に便利な関数や、 [exponential backoff retry関数](https://github.com/cyberark/bash-lib/blob/master/helpers/lib#L40) などがある。

使い方は、
- リポジトリをcloneする
- `bash-lib/init` をsourceするか、 `bash-lib/${使いたいライブラリ}/lib` をsourceする
- `bl_` prefixつきの関数が定義される
