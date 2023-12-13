---
title: neovim luaでtableの中身を見る
date: 2023-12-04T13:13:00+09:00
tags:
- Neovim
---

[Neovim](note/Neovim.md) で設定値を見ようとして `:lua print(hogeconfig)` とかすると、 `table: 0x7f5b93e5ff88` といったアドレスが出力されてしまう。
中身を見るためには、Neovimが提供している [vim.inspect](https://neovim.io/doc/user/lua.html#vim.inspect()) APIを使う。

````
:lua print(vim.inspect(vim.api.nvim_get_mode()))
{  blocking = false,  mode = "n"}
````

カーソル位置や、カレント行の内容といったものも出力できる

````
:lua print(vim.inspect(vim.api.nvim_win_get_cursor(0)))
{ 1, 12 }
:lua print(vim.inspect(vim.api.nvim_get_current_line()))
"Lorem ipsum blablabla"
````
