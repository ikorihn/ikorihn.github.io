---
title: PowerShellでLinuxコマンドを使用する
date: 2021-05-09T14:27:00+09:00
tags:
- Windows
- PowerShell
lastmod: 2021-05-09T14:40:01+09:00
---

## uutils/coreutils を使用する

[uutils/coreutils](https://github.com/uutils/coreutils)

* Rust製
* クロスプラットフォーム対応のcoreutils
* [Scoop](note/Scoop環境構築.md) でインストール可能

デフォルトのaliasを解除しておく

````powershell
Remove-Item alias:cp
Remove-Item alias:mv
Remove-Item alias:rm
Remove-Item alias:ls
Remove-Item alias:cat
Remove-Item alias:sort -Force
````

## その他コマンド

* [ripgrep](https://github.com/BurntSushi/ripgrep)
* [lsd](https://github.com/Peltoche/lsd)
* tree([lsd](https://github.com/Peltoche/lsd)を使う)

````powershell
Set-Alias grep rg
Set-Alias ls lsd

function ll() { lsd -l --blocks permission --blocks size --blocks date --blocks name --blocks inode $args}

function tree() { lsd --tree $args}
````
