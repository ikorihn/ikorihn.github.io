---
title: sedでsingle quoteをエスケープする
date: 2024-02-27T14:04:00+09:00
tags:
  - shell
  - sed
---

[[sed]] を使って `my mother` という文字列を `tom's mother` に変換しようとして、single quoteを単純にエスケープすればいいかと思ったがそうではなかった。
`$ echo 'my mother' | sed "s/my mother/tom's mother/"` のように外側をdouble quoteにすれば当然変換できるのだが、複雑なケースで外側をsingle quoteにしたかった。

## 試したこと

- `'s/my mother/tom\'s mother/'` -> うまくいかない
- `'s/my mother/tom'\''s mother/'` -> 一度文字列を閉じて、`\'` を打ったあと再度文字列を開始する。わかりにくい
- `'s/my mother/tom\x27s mother/'` -> `\x27` single quoteの16進表記を使う **これでうまくいった**

```shell
$ echo 'my mother' | sed 's/my mother/tom\x27s mother/'
tom's mother
```

