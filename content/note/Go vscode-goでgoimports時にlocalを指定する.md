---
title: Go vscode-goでgoimports時にlocalを指定する
date: "2022-12-22T11:12:00+09:00"
lastmod: "2022-12-22T11:12:00+09:00"
tags:
  - 'Go'
  - 'vscode'
---

vscodeでGoのコードフォーマットに `"go.formatTool": "goimports"` を指定していて、`-local` オプションが効かなかったので調べた。
`-local` は、`-local "github.com/my/module"` のように指定すると、importをサードパーティのモジュールと自身のモジュールでグループ分けしてくれるオプション

```go
import (
    "fmt"
    "os"

    "github.com/other/module1"
    "github.com/other/module2"

    "github.com/my/module/client"
    "github.com/my/module/service"
)

```

## `go.formatFlags` 

https://github.com/golang/vscode-go/wiki/settings#goformatflags

これは効かない

> Not applicable when using the language server.

```json
{
  "go.formatFlags": [
    "-local",
    "github.com/my/module"
  ],
}
```

## `gopls."formatting.local"`

こちらが正しい

```json
{
  "gopls": {
    "formatting.local": "github.com/my/module"
  },
}
```
