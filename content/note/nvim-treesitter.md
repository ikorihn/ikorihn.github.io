---
title: nvim-treesitter
date: 2023-05-19T12:03:00+09:00
tags:
- Neovim
---

[nvim-treesitter/nvim-treesitter: Nvim Treesitter configurations and abstraction layer](https://github.com/nvim-treesitter/nvim-treesitter)

[Neovim](note/Neovim.md) でtree-sitterを使ってテキストの構文解析やハイライトなどの機能を実現するプラグイン

[tree-sitterについて](https://tree-sitter.github.io/tree-sitter/)

 > 
 > Tree-sitter is a parser generator tool and an incremental parsing library. It can build a concrete syntax tree for a source file and efficiently update the syntax tree as the source file is edited. Tree-sitter aims to be:
 > 
 > General enough to parse any programming language
 > Fast enough to parse on every keystroke in a text editor
 > Robust enough to provide useful results even in the presence of syntax errors
 > Dependency-free so that the runtime library (which is written in pure C) can be embedded in any application

さまざまなプログラミング言語やファイル形式の構文解析をサポートしていて、独自に追加することもできます。

* ソースコードやテキストファイルを構文解析し、抽象構文木（AST）を生成します。これにより、コードの構造や意味を理解し、他の機能を実現する基盤となります。
* 構文解析の結果を使用して、シンタックスハイライトを行います
* [パーサーを追加することが可能です](https://github.com/nvim-treesitter/nvim-treesitter#adding-parsers)
