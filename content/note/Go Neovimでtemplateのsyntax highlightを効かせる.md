---
title: Go Neovimでtemplateのsyntax highlightを効かせる
date: 2023-05-19T11:55:00+09:00
tags:
- 2023/05/19
- Go
- Neovim
---

これを入れた

{{< card-link "https://github.com/ngalaiko/tree-sitter-go-template" >}}

[text/template](https://pkg.go.dev/text/template) の [nvim-treesitter](note/nvim-treesitter.md) 向けのパーサー

## セットアップ

公式の通りだがメモしておく

1. parserに追加したあと、 `:TSInstallFromGrammar gotmpl`

````lua
local parser_config = require'nvim-treesitter.parsers'.get_parser_configs()
parser_config.gotmpl = {
  install_info = {
    url = "https://github.com/ngalaiko/tree-sitter-go-template",
    files = {"src/parser.c"}
  },
  filetype = "gotmpl",
  used_by = {"gohtmltmpl", "gotexttmpl", "gotmpl", "yaml"}
}
````

2. gotmplを検知したらfiletypeに設定されるようにする

luaで書く場合はこんな感じに

````lua
vim.api.nvim_create_autocmd({ "BufNewFile", "BufRead" }, {
  pattern = { "*.tmpl" },
  callback = function()
    if vim.fn.search("{{.\\+}}", "nw") ~= 0 then
        vim.bo.filetype = "gotmpl"
    end
  end,
})
````

3. [queries](https://github.com/nvim-treesitter/nvim-treesitter#adding-queries) に追加する

`~/.config/nvim/queries/gotmpl/injections.scm`

````
(text) @yaml
````

`~/.config/nvim/queries/gotmpl/highlights.scm`

````
; Identifiers

[
    (field)
    (field_identifier)
] @property

(variable) @variable

; Function calls

(function_call
  function: (identifier) @function)

(method_call
  method: (selector_expression
    field: (field_identifier) @method))

; Operators

"|" @operator
":=" @operator

; Builtin functions

((identifier) @function.builtin
 (#match? @function.builtin "^(and|call|html|index|slice|js|len|not|or|print|printf|println|urlquery|eq|ne|lt|ge|gt|ge)$"))

; Delimiters

"." @punctuation.delimiter
"," @punctuation.delimiter

"{{" @punctuation.bracket
"}}" @punctuation.bracket
"{{-" @punctuation.bracket
"-}}" @punctuation.bracket
")" @punctuation.bracket
"(" @punctuation.bracket

; Keywords

[
    "else"
    "else if"
    "if"
    "with"
] @conditional

[
    "range"
    "end"
    "template"
    "define"
    "block"
] @keyword

; Literals

[
  (interpreted_string_literal)
  (raw_string_literal)
  (rune_literal)
] @string

(escape_sequence) @string.special

[
  (int_literal)
  (float_literal)
  (imaginary_literal)
] @number

[
    (true)
    (false)
] @boolean

[
  (nil)
] @constant.builtin

(comment) @comment
(ERROR) @error
````
