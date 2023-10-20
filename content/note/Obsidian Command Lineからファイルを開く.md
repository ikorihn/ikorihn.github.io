---
title: Obsidian Command Lineからファイルを開く
date: 2023-05-05T18:54:00+09:00
tags:
- 2023/05/05
- obsidian
- CLI
---

[Command Line Interface to open files/folders in Obsidian from the terminal - Feature requests - Obsidian Forum](https://forum.obsidian.md/t/command-line-interface-to-open-files-folders-in-obsidian-from-the-terminal/860/20)

[URL Scheme](https://help.obsidian.md/Advanced+topics/Using+Obsidian+URI) が実装されたため、Macでは以下のようにして開くことができる。

````shell
VAULT=myvault
FILE='my%20file'
obsidian="obsidian://open?vault=${VAULT}&file=${FILE}"
````
