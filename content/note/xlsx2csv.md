---
title: xlsx2csv
date: "2021-05-13T22:24:00+09:00"
tags:
    - 'shell'
---

<https://github.com/dilshod/xlsx2csv>

```sh
$ xlsx=新しいファイル.xlsx
$ xlsx2csv -a -q all $xlsx ${xlsx/.xlsx/}
-a: すべてのシートをcsvにする
-q: カラムをダブルクウォートで囲む
```

-aをつけると、ディレクトリが作成されその中にシートごとにcsvが作られる
