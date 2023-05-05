---
title: vimでマーカー文字列を埋め込んでファイルを折りたたむ
date: 2022-03-18T12:17:00+09:00
tags:
- vim
---

[Vim](note/Vim.md) の折りたたみ機能を使って、markerを埋め込み大きなファイルを移動しやすくすることができます。

[マーカー文字列を埋め込んで、ソースコードを折り畳み表示する — 名無しのvim使い](https://nanasi.jp/articles/howto/fold/fold-marker.html)
[.vimrc整理術 - Qiita](https://qiita.com/naoty_k/items/674787bc2d9885f81a0b)

## markerで囲む

vimには、コードの中にある目印となるマーカー （デフォルトでは「{{{」と「}}}」） を書いておくことで、そのマーカーに囲まれた範囲を折り畳む機能があります。
さらに数字をつけることで階層を設定することもできる。

````vim
" 基本設定 {{{1

set nocompatible
set number

" マッピング {{{1

nnoremap H b
nnoremap J }
nnoremap K {
nnoremap L w

" カラースキーム {{{1

syntax on
colorscheme hybrid

" プラグイン {{{1

" neobundle {{{2

...

" unite.vim {{{2

...

" neocomplcache {{{2

...

````

## modelineを有効にする

[モードラインを使って、ファイルごとにvimエディタのオプションを指定する。 — 名無しのvim使い](http://nanasi.jp/articles/howto/file/modeline.html)

````vim
" モードラインを有効にする
set modeline

" 3行目までをモードラインとして検索する
set modelines=3
````

## modelineで折りたたみの設定をする

ファイルの最初か最後に以下を追加する。

````vim
" vim: foldmethod=marker
" vim: foldcolumn=3
````

## folding系のコマンド

[vimで折畳み(folding)まとめ - Qiita](https://qiita.com/ysuzuki19/items/23a998d3636684ec1ca1)

詳しくは `help fold`

````
コマンド	動作
zf	折畳作成
zd	折畳削除
zD	折畳を全て削除
zE	ページ全体の折畳みを全て削除
visual + zf	選択範囲を折畳
2 + zF	2行折畳
2,5 fo	2行から5行を折畳
zo	折畳を削除せず開く
zO	折畳みを全て削除せず開く
zc	開いている折畳を閉じる
zC	開いている折畳を全て閉じる
za	折畳の状態を切り替える
zA	全ての折畳の状態を切り替える
zv	カーソル行を表示
zx	折畳のUndo
zX	折畳のRedo
zm	ページ内の折畳を一段階閉じる
zM	ページ内の折畳を全段階閉じる
zr	ページ内の折畳を一段階開く
zR	ページ内の折畳を全段階開く
2,5 foldo	2行から5行の折畳を開く
2,5 foldc	2行から5行の折畳を閉じる
zn	ファイル全体の折畳を開く
zN	ファイル全体の折畳を閉じる
zi	ファイル全体の折畳の状態を反転
zj	上の折畳に移動
zk	下の折畳に移動
````
