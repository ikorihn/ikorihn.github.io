---
title: Goでzsh_historyをパースするプログラムを書いてみる
date: 2021-06-13T23:06:00+09:00
lastmod: 2021-06-13T23:06:48+09:00
tags:
- zsh
---

\#zsh

## Goでzsh_historyをパースするプログラムを書いてみる

[zsh 文字化けしたzsh_historyファイルを読めるようにする](note/zsh%20文字化けしたzsh_historyファイルを読めるようにする.md), [zsh マルチバイト文字をzsh_historyの形式に変換する](note/zsh%20マルチバイト文字をzsh_historyの形式に変換する.md) の仕様に則って、パース処理を書いていく

````go
package zhistconv

const (
	// zsh_historyの仕様で、各バイトが0x83~0xA2のとき、その前に0x83を入れて6bit目を反転させる
	x83 = 131
	xA2 = 162
	x20 = 32
)

// zsh_historyを読める形式に変換する
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

// プレーンなテキストをzsh_historyに変換する
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
