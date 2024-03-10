---
title: Poetryで依存関係を更新したときに自動的にrequirements.txtも更新する
date: 2024-03-07T12:12:00+09:00
tags:
  - Python
---
 
開発環境では [[Poetry]] を使い、CIやコンテナ上ではシンプルにpipでインストールしたかったので、
`poetry export -f requirements.txt -o requirements.txt` で出力したrequirements.txtもコミットするようにしていた。
そうすると当然(？)反映漏れが発生するわけなので、poetryでの変更に自動で追従してくれないかなと思った

そんな機能を実現してくれるプラグインがあった。

## poetry-auto-export プラグイン

{{< card-link "https://github.com/Ddedalus/poetry-auto-export" >}}

これをpoetryのプラグインとして追加する

```shell
poetry self add poetry-auto-export
```

`pyproject.toml` にこちらのように書いておく

```toml
[tool.poetry-auto-export]
output = "requirements.txt"
without_hashes = true
without = ["dev"]
```

すると、`poetry add` や `poetry lock` などのコマンドを実行したときに自動で `requirements.txt` にも反映してくれるようになる。