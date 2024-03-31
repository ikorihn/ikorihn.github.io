---
title: QuickSight ISO8601形式の文字列をDate型にする
date: 2024-03-15T15:09:00+09:00
tags:
  - Athena
---

[Athenaのdate format](https://docs.aws.amazon.com/quicksight/latest/user/supported-date-formats.html) では、ISO8601形式の日付(`2024-01-02T15:04:05+09:00`)がサポートされていない。

QuickSight で取り込む際にも、Change data type -> Date としたときにフォーマットを選択できるのだが、 `yyyy-MM-dd'T'HH:mm:ssXXX` ではフォーマットエラーとなった。
苦肉の策として `yyyy-MM-dd'T'HH:mm:ss'+09:00'` とオフセット部分を単なる文字列にすることで変換できたが、こうするとUTCとして読み込まれて9時間ずれる。
読み手で+9時間するのも微妙なので、なんとかできないかを調べた

## calculated fieldを追加する

[【小ネタ】Amazon QuickSight でデータのタイムゾーンを変更できないか試してみた | DevelopersIO](https://dev.classmethod.jp/articles/change-timezone-on-quicksight/)
こちらをヒントに、Date型のcalculated fieldを追加することにした。

Data setの編集画面から `Add calculated field` を選ぶ

![[Pasted-image-20240315032245.png]]

次の計算式を入れる。なお、JSTであることを前提にしているので複数のタイムゾーンが含まれている場合は同じようにはできないかもしれない(未確認)
```
addDateTime(-9, "HH", parseDate(<日付文字列のfield>, "yyyy-MM-dd'T'HH:mm:ss'+09:00'"))
```

するとUTC時刻でDate型のFieldが追加されるので、これをダッシュボードなりで利用できる。

2023年11月に、タイムゾーンが変更できるようになったので、date型にしておけばいつでも表示を変えることができる。
[[アップデート] Amazon QuickSight で遂にタイムゾーンが変更出来るようになりました | DevelopersIO](https://dev.classmethod.jp/articles/quicksight-custom-timezone/)

## 参考

- [Converting dates and timestamp fields in QuickSight - Learning Center / Articles - Amazon QuickSight Community](https://community.amazonquicksight.com/t/converting-dates-and-timestamp-fields-in-quicksight/10006)
