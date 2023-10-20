---
title: c++環境構築
date: 2021-02-07T23:27:00+09:00
tags:
- 競プロ
- c++
lastmod: 2021-05-30T18:52:58+09:00
---

# c++環境構築

## gccインストール

<https://qiita.com/EngTks/items/ffa2a7b4d264e7a052c6>

### 初期状態

````shell
g++ --version
````

Clangがデフォルトで入っている
gccにのみ、stdc++.hというC++の標準ライブラリの集合体が入っているので有利

### install

````shell
brew install gcc
````

### pathの設定

````shell
$ cd /usr/local/bin
$ ls -al | grep g++
$ ln -s g++-10 g++
$ g++ --version
g++ (Homebrew GCC 10.2.0_3) 10.2.0
Copyright (C) 2020 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
````

### stdc++.hを使えるようにする

````shell
$ cp /usr/local/Cellar/gcc/10.2.0_3/include/c++/10.2.0/x86_64-apple-darwin20/bits/stdc++.h /usr/local/Cellar/gcc/10.2.0_3/include/c++/10.2.0/bits/
````

### エラー

````shell
$ gcc hello.cpp
clang: error: invalid version number in '-mmacosx-version-min=11.1'
````

<https://stackoverflow.com/questions/63972113/big-sur-clang-invalid-version-error-due-to-macosx-deployment-target>

Big Surにアップデートした影響っぽい

````shell
sudo xcode-select --switch /Library/Developer/CommandLineTools
````

## vim + LSP

<https://endaaman.me/tips/nvim-coc-ccls>

### LSP

clangd, cquery, ccls が有名らしい
clangdは重いらしい
cqueryは開発がストップしている
cclsを入れる

[ccls](https://github.com/MaskRay/ccls/wiki)

````shell
brew install ccls
````

### cclsの設定

cclsのLSPサーバーに対して、シンボルの定義やその定義されたファイルパスなどを教える必要がある。 `compile_commands.json` を使う。
<https://github.com/rizsotto/Bear> で簡単に生成できる

````shell
brew install bear
````

=> Makefile作ってないから？使い方がよくわからなかった

#### shell script wrapper

<https://github.com/MaskRay/ccls/wiki/Build#macos>

````shell
$ touch /usr/local/bin/ccls
$ chmod +x /usr/local/bin/ccls
$ vim /usr/local/bin/ccls
````

````shell
#!/bin/sh
exec /usr/local/Cellar/ccls/0.20201219/bin/ccls -init='{"clang":{"extraArgs":["-isystem", "/usr/local/Cellar/gcc/10.2.0_3/include/c++/10.2.0"]}}' "$@"
````

### vim-lsp

<https://github.com/prabirshrestha/vim-lsp/wiki/Servers-ccls>

````shell
if executable('ccls')
   au User lsp_setup call lsp#register_server({
      \ 'name': 'ccls',
      \ 'cmd': {server_info->['ccls']},
      \ 'root_uri': {server_info->lsp#utils#path_to_uri(lsp#utils#find_nearest_parent_file_directory(lsp#utils#get_buffer_path(), 'compile_commands.json'))},
      \ 'initialization_options': {},
      \ 'whitelist': ['c', 'cpp', 'objc', 'objcpp', 'cc'],
      \ })
endif
````

### quickrun

<https://kenbannikki.com/notes/quickrun-for-cpp/>

````shell
let g:quickrun_config.cpp = {
    \ 'command': 'g++',
    \ 'input': 'input',  " inputというファイルを標準入力として与える
    \ 'runner': 'system'  " 非同期実行を行わない
    \ }
````

この状態で:QuickRunか<leader>+ rすればソースファイルがコンパイルされ、inputというファイルを標準入力として与えられた状態でプログラムが実行されます。

コマンドを打ち込む場合は、:QuickRun -input inputまたは:QuickRun \<inputとすれば同じことができます。

また、:QuickRun -input =5または:QuickRun \<=5で数値や文字列を直接渡すことができます。
