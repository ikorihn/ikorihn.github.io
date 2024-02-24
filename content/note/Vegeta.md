---
title: Vegeta
date: 2023-10-31T17:26:00+09:00
tags:
  - loadtest
---

{{< card-link "https://github.com/tsenart/vegeta" >}}

[[Go]]製の負荷試験ツール。
CLIやライブラリとして利用できる。
トップ画からも分かる通り、名前の由来はあの王子。

## 使い方

`vegeta attack` コマンドで負荷リクエストを投げられる。
シンプルに標準入力でリクエストを与えることができる。
    
```shell
echo "GET http://localhost/" | vegeta attack -duration=5s > result.bin
```

- `-duration` 実行時間
- `-rate` 秒間のリクエスト数

ファイルを指定してリクエストすることも可能

```shell
vegeta attack -duration=5s -target=vegeta.txt > result.bin
```

```txt:vegeta.txt
GET https://example.com/get?id=1

GET https://example.com/get?id=2

# ヘッダーは次の行に続けて書く(複数書くこともできる)
GET https://example.com/get?id=3
Authorization: Token DEADBEEF
X-Account-ID: 42

# post bodyのファイルを@で指定可
POST http://goku:9090/things
X-Account-ID: 42
@/path/to/newthing.json
```

vegeta report でサマリを出力

```shell
vegeta report result.bin
```
