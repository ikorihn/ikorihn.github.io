---
title: LuaSnipのpostfixを設定する
date: 2023-12-29T18:51:00+09:00
tags:
  - Neovim
---

 [[LuaSnip]] で自前のPostfix snippetを設定する方法を調べた。

Postfix snippetは、例えば [[Go]] で `xxx.split` と打つと `strings.Split(xxx, "")` に展開されるといった、後方に入力したタイミングで前方の文字ごと補完する機能でIDEだとよくあるあれ。

LuaSnipでは以下のようにする。

https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#postfix-snippet

```lua
local status_ok, ls = pcall(require, "luasnip")
if not status_ok then return end

local f = ls.function_node
local postfix = require("luasnip.extras.postfix").postfix

ls.add_snippets("all", {
  postfix(".br", {
    f(function(_, parent) return "[" .. parent.snippet.env.POSTFIX_MATCH .. "]" end, {}),
  }),
})
```

これで `abc.br` とすると、 `[abc]` に展開される。

[[Go]] で `xxx.len` を `len(xxx)` に展開したかったので、以下のような設定を追加した。

```lua
ls.add_snippets("go", {
  postfix(".len", {
    f(function(_, parent) return "len(" .. parent.snippet.env.POSTFIX_MATCH .. ")" end, {}),
  }),
}
```
