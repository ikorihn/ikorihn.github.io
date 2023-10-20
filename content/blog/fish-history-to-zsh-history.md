---
title: fishのhistoryをzshに移行する
date: 2021-06-08T19:00:00+09:00
updated-date: 2021-06-08T19:00:00+09:00
description: ''
tags:
- fish
- zsh
---

一年くらいfishを使っていたが、文法があまりにbash/zshと異なり辛いため、zshに戻すことにした。
コマンド履歴に頼る人間なので、直近1年の履歴がなくなってしまうのは困る。
そこでfishのhistoryファイルをzshのhistoryファイルに移行することにした。

````toc
# This code block gets replaced with the TOC
````

## 移行ツール

移行するためのツールを作った。

<https://github.com/ikorihn/zhistconv>

使い方

````shell
# fish_hisoryをzsh_historyに変換して追記(事前にバックアップを取ることを推奨)
$ zhistconv fish fish_hist >> ~/.zsh_history
$ history -E 1
=> 結合されたhistoryが表示される
````

以下詳細

## fishのhistoryファイルをzshのhistoryファイルの形式に変換する

### fishのhistoryファイル

`~/.local/share/fish/fish_history`

````yaml
- cmd: echo hello
  when: 1621067042
- cmd: git pull
  when: 1621067359
````

yaml形式で保存されているので、yamlをロードして変換してあげればいい

### zshのhistoryファイル

`~/.zsh_history`

````txt
: 1621066935:0;echo hello
: 1621066935:0;cd
````

`: <unix timestamp>:0:<command>` 形式(真ん中の0が何を意味しているかは調べてない)

## zshのマルチバイト文字の扱いについて

一つ問題があった。移行ツールをわざわざ作ったのはほとんどこの仕様のため

`~/.zsh_history` をUTF-8で開くと、日本語が文字化けしていた。
historyコマンドの結果は文字化けしていない。

どうやらマルチバイト文字が特殊な扱いをされているらしい。

[.zsh_historyにおける非ASCII文字の扱いについて - 生涯未熟](https://syossan.hateblo.jp/entry/2017/10/09/181928)
[unmetafy unicode when zsh by rogerdehe · Pull Request #416 · dvorka/hstr](https://github.com/dvorka/hstr/pull/416)

metafy/unmetafyという処理をしているらしく、
メタなバイトがあったら直前に `0x83` を挿入して、`0x20`とのxorを取り6bit目を反転させているようだ。

<https://github.com/zsh-users/zsh/blob/master/Src/utils.c#L4921-L4933>

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

単純にfish_historyを変換してzsh_historyに貼り付けるだけでは、日本語部分が文字化けしてしまう。

### 文字化けしたzsh_historyファイルを読めるようにする

`ぁあぃいぅうぜそぞただちぢっつづ` という文字列を使って調べていく。
これらは頭2バイトが `e381`、末尾1バイトがそれぞれいかのようになる。

* `ぁ`: `81`
* `あ`: `82`
* `ぃ`: `83`
* `い`: `84`
* `ぅ`: `85`
* `う`: `86`
* `ぜ`: `9c`
* `そ`: `9d`
* `ぞ`: `9e`
* `た`: `9f`
* `だ`: `a0`
* `ち`: `a1`
* `ぢ`: `a2`
* `っ`: `a3`
* `つ`: `a4`
* `づ`: `a5`

zsh_historyで見ると以下のようなバイト列になっている(わかりやすいよう適宜スペースを入れている)

````txt
E38181 E38182 E38183A3 E38183A4 E38183A5 E38183A6 E38183BC E38183BD E38183BE E38183BF E3818380 E3818381 E3818382 E381A3 E381A4 E381A5
````

zsh_historyの文字コードはlatin1なのでほぼUTF-8と同じ。
文字コード表をもとに当てはまる文字に戻すと、 `0x83-0xA2` のとき、直前に `0x83` を入れてから6bit目を反転させていることがわかる。

````txt
E38181 E38182 E38183A3 E38183A4 E38183A5 E38183A6 E38183BC E38183BD E38183BE E38183BF E3818380 E3818381 E3818382 E381A3 E381A4 E381A5
````

`0x83` を消して、直後の6bit目を反転させると以下のようになる

````txt
E38181 E38182 E38183 E38184 E38185 E38186 E3819C E3819D E3819E E3819F E381A0 E381A1 E381A2 E381A3 E381A4 E381A5
````

これがもとの文字列のバイト列に一致する。

マルチバイト文字をzsh_historyの形式に変換するには上と逆のことをすればいい。
つまり、`0x83-0xA2` のとき、直前に `0x83` を入れてから6bit目を反転させる。

### Goでzsh_historyをパースするプログラムを書いてみる

````go
package zhistconv

const (
	// zsh_historyの仕様で、各バイトが0x83~0xA2のとき、その前に0x83を入れて6bit目を反転させる
	x83 = 131
	xA2 = 162
	x20 = 32
)

func ParseZshHistory(latin1Byte []byte) []byte {
	isMarking := false
	var byteBuffer []byte

	for _, codePoint := range latin1Byte {
		if codePoint == x83 {
			isMarking = true
			continue
		}

		if isMarking {
			// 6bit目を反転させるために0x20をXORする
			invertCodePoint := codePoint ^ x20
			byteBuffer = append(byteBuffer, invertCodePoint)
			isMarking = false
		} else {
			byteBuffer = append(byteBuffer, codePoint)
		}
	}

	return byteBuffer
}

func ConvertToZshHistory(latin1Byte []byte) []byte {
	var byteBuffer []byte

	for _, codePoint := range latin1Byte {
		// 131は0metacharの10進数表現
		if x83 <= codePoint && codePoint <= xA2 {
			// 6bit目を反転させるために0x20をXORする
			invertCodePoint := codePoint ^ x20
			byteBuffer = append(byteBuffer, x83)
			byteBuffer = append(byteBuffer, invertCodePoint)
		} else {
			byteBuffer = append(byteBuffer, codePoint)
		}
	}

	return byteBuffer
}
````

## 作ったツールについて

[urfave/cli: A simple, fast, and fun package for building command line apps in Go](https://github.com/urfave/cli)

こちらを使ってcliツールを作った。

* `zhistconv fish`: fish_historyをzsh_historyの形式に変換して標準出力する
* `zhistconv parse`: zsh_historyをUTF-8に変換する
* `zhistconv reverse`: UTF-8で書かれたzsh_historyのマルチバイト文字をzsh_historyの仕様に変換する
