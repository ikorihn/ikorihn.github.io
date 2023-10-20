---
title: RustでCLIを作る
date: 2022-09-21T22:47:00+09:00
tags:
- Rust
- Neovim
lastmod: 2022-09-21T22:47:00+09:00
---

## neovimでrustを使えるようにする

LSPはrust-analyzerを使う

````shell
brew install rust-analyzer
````

もしくはneovimでmasonを使っている場合は `:MasonInstall rust-analyzer`

````lua
local lspconfig_status_ok, lspconfig = pcall(require, "lspconfig")
if not lspconfig_status_ok then
  return
end

local opts = {
  on_attach = require("lsp.handlers").on_attach,
  capabilities = require("lsp.handlers").capabilities,
}

lspconfig['rust_analyzer'].setup(opts)

````

### formatter

<https://github.com/rust-lang/rustfmt>

````shell
rustup component add rustfmt
````

`:RustFmt` はとくに何も設定しなくても使えたけど、エラーが出て効かなかった

````
Error detected while processing function rustfmt#Format[7]..<SNR>64_RunRustfmt:
line   48:
E776: No location list
````

`:!rustfmt %` で代用したらRust 2018からじゃないと使えない記法でエラーになった。
`rustfmt.toml` を作って `edition = "2021"` を書いた

保存時に実行してほしかったのでこうした。
cursor位置が先頭に行ってしまうので、 `nvim_win_get_cursor` で位置を保存しておいてからrustfmt実行
rustfmt.toml を見てくれないのでeditionを明示した。これだとプロジェクトによっては設定読めなくてformatずれるな。

````lua
function rustfmt(wait_ms)
  local curpos = vim.api.nvim_win_get_cursor(0)
  vim.cmd [[ %!rustfmt --edition "2021" ]]
  vim.api.nvim_win_set_cursor(0, curpos)
end

vim.cmd [[
  augroup rustfmt
    autocmd!
    autocmd BufWritePre *.rs lua rustfmt()
  augroup end
]]

````

Rustなにもわからないのでとりあえずこれをベースにする
[Building My First Command Line Interface (CLI) with Rust | by Adam Berg | Geek Culture | Medium](https://medium.com/geekculture/building-my-first-command-line-interface-cli-with-rust-b6beb9c284e0)

## 初期化

`cargo new パッケージ名` もしくは `cargo init` で作成
Cargo.tomlができる

`cargo add クレート名` でライブラリを追加する

````shell
cargo add reqwest tokio
````

-> `features` も設定したかったけどコマンドだとよくわからなかったのでtoml直接修正する

## clapを使ってみる

ClapというcrateがCLI作るときに便利なライブラリのようなので、これを使ってもいいかも
[RustのClapクレートがメチャクチャ良かった話](https://zenn.dev/shinobuy/articles/53aed032fe5977)

deriveっていうのが今風らしい
[Rust | clap v3系でCLIツールを作成する - dotTrail](https://dottrail.codemountains.org/rust-clap-v3-cli-app/)

## reqwest

responseのJSONをparseしたかったので[serde](https://github.com/serde-rs/serde)をいれてみた

````toml
serde = { version = "1.0", features = ["derive"] }
reqwest = { version = "0.11", features = ["blocking", "json"] }

````
