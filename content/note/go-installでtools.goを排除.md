---
title: go-installでtools.goを排除
date: "2021-06-30T10:17:00+09:00"
lastmod: '2021-06-30T10:19:19+09:00'

---

#Go

<https://zenn.dev/tarotaro0/articles/1d5bf3e32d5ef2>

[[note/Go]] ではnpmのdevdependenciesの仕組みがないため、通常だとgo.modから消えてしまう

そこで、これらのツールをmoduleによって管理するために、`tools.go`を用いる方法が[公式のgo wikiでも紹介されている](https://github.com/golang/go/wiki/Modules#how-can-i-track-tool-dependencies-for-a-module)。

```go
// +build tools

package tools

import (
	// Tools we use during development.
	_ "golang.org/x/lint/golint"
	_ "honnef.co/go/tools/cmd/staticcheck"
)
```
