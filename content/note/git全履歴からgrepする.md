---
title: git全履歴からgrepする
date: "2021-06-03T20:46:00+09:00"
lastmod: '2021-06-03T20:55:47+09:00'
tags:
  - 'git'

---

#git

<https://suzuken.hatenablog.jp/entry/2018/12/05/155040>

## ファイルの中身を検索

`git grep`

過去のcommitにあったすべてのコードから正規表現で検索する

```shell
$ git grep '<regexp>' $(git rev-list --all)
```

pathを指定する場合は以下

```shell
$ git grep '<regexp>'  $(git rev-list --all -- path/to/dir) -- path/to/dir
```

-   `-w`: wordマッチ
-   `-v`: 一致しない
-   `-I`: binaryを無視

## 変更内容を検索

コミットの内容をキーワード検索できる

### コミットメッセージとコミットの内容の両方を検索

```shell
$ git log -S '<word>'
```

`-S` オプションで文字列をルックアップできる。 `-G` だと正規表現がつかえる。

### コミットメッセージのみ検索

```shell
$ git log --grep="<word>"
```

-   `-p | --patch`: 差分内容も見れる
