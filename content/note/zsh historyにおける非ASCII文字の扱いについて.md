---
title: zsh historyにおける非ASCII文字の扱いについて
date: 2021-05-13T18:14:00+09:00
tags:
- zsh
---

## [zsh](note/zsh.md) のヒストリファイルの仕様について

zshのhistoryファイルを直接開くと、日本語が文字化けしているが、
historyコマンドの結果は文字化けしていない。

内部でなにか変換をかけているはずで、調べてみたところ、同じようなところで困っている人がいた。

https://github.com/dvorka/hstr/pull/416
[.zsh_historyにおける非ASCII文字の扱いについて - 生涯未熟](https://syossan.hateblo.jp/entry/2017/10/09/181928)

どうやらmetafy/unmetafyという処理をしているらしく、
メタなバイトがあったら `0x83` を挿入して、`0x20`とのxorを取り6bit目を反転させている。

https://github.com/zsh-users/zsh/blob/master/Src/utils.c#L4921-L4933

````c
mod_export char *
unmetafy(char *s, int *len)
{
    char *p, *t;

    for (p = s; *p && *p != Meta; p++);
    for (t = p; (*t = *p++);)
	if (*t++ == Meta && *p)
	    t[-1] = *p++ ^ 32;
    if (len)
	*len = t - s;
    return s;
}
````

* [zsh 文字化けしたzsh_historyファイルを読めるようにする](note/zsh%20文字化けしたzsh_historyファイルを読めるようにする.md)
* [zsh マルチバイト文字をzsh_historyの形式に変換する](note/zsh%20マルチバイト文字をzsh_historyの形式に変換する.md)
* [Goでzsh_historyをパースするプログラムを書いてみる](note/Goでzsh_historyをパースするプログラムを書いてみる.md)
* [fishのhistoryをzshに変換](note/fishのhistoryをzshに変換.md)
