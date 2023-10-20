---
title: shellのプロセス置換Process Substitution
date: 2023-01-04T16:49:00+09:00
tags:
- 2023/01/04
- shell
- zsh
lastmod: 2023-01-04T16:56:00+09:00
---

[プロセス置換 (Process Substitution)について - 一から勉強させてください](https://dangerous-animal141.hatenablog.com/entry/2020/06/06/175650)
[zsh: 14 Expansion](https://zsh.sourceforge.io/Doc/Release/Expansion.html#Process-Substitution)

diffとかで見るこの書き方

````shell
$ diff <(ls one.txt) <(ls two.txt)
````

コマンドの結果をinputとして渡しているように見える。
リダイレクトに見えるが矢印の方向が逆

* `<(list)`
  * リストの結果を入力ファイルに置き換える
* `>(list)`
  * リストの結果を出力ファイルに置き換える

[shellのリダイレクト](note/shellのリダイレクト.md)

## 応用例

[標準出力と標準エラー出力にリダイレクトしながら出力をターミナルに表示 (bash, tee, process substitution) - いろいろ備忘録日記](https://devlights.hatenablog.com/entry/2022/02/04/073000)

````shell
$ ./script.sh 1> >(tee -a stdout.log) 2> >(tee -a stderr.log >&2)
````

このようにすると、 `./script.sh` の出力をteeコマンドのプロセスにリダイレクトすることで、標準出力しつつファイルに書くことができる
