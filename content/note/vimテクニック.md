---
title: vimテクニック
date: 2022-03-16T12:59:00+09:00
tags:
- vim
---

## 現在のファイル内をgrepする

QuickFixにわたすといい感じ

`:grep /pattern/ % | cw`

## vimgrepをripgrepで行う

.vimrcに以下を書く

````vim
" Use extend grep
if executable('rg')
    let &grepprg = 'rg --vimgrep --no-hidden'
    set grepformat=%f:%l:%c:%m
endif
````

## `<C-r>` を使う

コマンドモードで `<C-r>` のあとに続けて入力することで、いろいろなペーストができる

````
:help <C-r>

CTRL-R {register}					*c_CTRL-R* *c_<C-R>*
			'"'	the unnamed register, containing the text of
				the last delete or yank
			'%'	the current file name
			'#'	the alternate file name
			'*'	the clipboard contents (X11: primary selection)
			'+'	the clipboard contents
			'/'	the last search pattern
			':'	the last command-line
			'-'	the last small (less than a line) delete
			'.'	the last inserted text


CTRL-R CTRL-F				*c_CTRL-R_CTRL-F* *c_<C-R>_<C-F>*
CTRL-R CTRL-P				*c_CTRL-R_CTRL-P* *c_<C-R>_<C-P>*
CTRL-R CTRL-W				*c_CTRL-R_CTRL-W* *c_<C-R>_<C-W>*
CTRL-R CTRL-A				*c_CTRL-R_CTRL-A* *c_<C-R>_<C-A>*
CTRL-R CTRL-L				*c_CTRL-R_CTRL-L* *c_<C-R>_<C-L>*
		Insert the object under the cursor:
			CTRL-F	the Filename under the cursor
			CTRL-P	the Filename under the cursor, expanded with
				'path' as in |gf|
			CTRL-W	the Word under the cursor
			CTRL-A	the WORD under the cursor; see |WORD|
			CTRL-L	the line under the cursor

````

[愛用しているvimプラグイン](public/愛用しているvimプラグイン.md)
[vim 使っているplugin](note/vim%20使っているplugin.md)
[ファイル同士の比較をvimdiffで取る](note/ファイル同士の比較をvimdiffで取る.md)
[Vimでバッファ同士の差分をとる](note/Vimでバッファ同士の差分をとる.md)
[vimでbuffer同士のdiffを取る](note/vimでbuffer同士のdiffを取る.md)
[Vimでアルファベットを連番で入力する](note/Vimでアルファベットを連番で入力する.md)
[fzf.vimの使い方](note/fzf.vimの使い方.md)
[vimでマーカー文字列を埋め込んでファイルを折りたたむ](note/vimでマーカー文字列を埋め込んでファイルを折りたたむ.md)
