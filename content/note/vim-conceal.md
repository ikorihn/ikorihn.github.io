---
title: vim-conceal
date: "2020-12-26T15:33:00+09:00"
tags:
  - vim
lastmod: '2021-05-30T18:44:06+09:00'

---

# vim conceal

## きっかけ

vimでmarkdownを編集中、_斜体_や**太字**を表すためのアンダースコアやアスタリスクが表示されなくなってしまった。
カーソル位置と編集してる位置がずれてしまったり、どこに隠れているのかがわかりにくくて記号じゃなくて文字のほうを消してしまったりと不便だったので、見えるようにしたい。

-   個人の感覚によると思うが、私はテキスト編集中はあるがままに表示してほしい
-   colorschemeでわかりやすく表示されるので、隠す必要がない

## 調査

.vimrcやpluginをON/OFFしながら確認した結果、 [Yggdroot/indentLine](https://github.com/Yggdroot/indentLine) を有効にしていると発生することがわかった。
READMEでこちらの記載を見つけた。

> Change Conceal Behaviour
>
> This plugin enables the Vim conceal feature which automatically hides stretches of text based on syntax highlighting. This setting will apply to all syntax items.
>
> For example, users utilizing the built in json.vim syntax file will no longer see quotation marks in their JSON files.

どうやらconcealという設定で、例えばJSONのquotationを非表示にするといったことができるらしい。

concealについての設定のデフォルト値が以下のようになっている。

    let g:indentLine_concealcursor = 'inc'
    let g:indentLine_conceallevel = 2

## 対応方法

dein.nvimを使用しているので、以下のように設定した

    [[plugins]]
    repo = 'Yggdroot/indentLine'
    hook_add = '''
        let g:indentLine_conceallevel = 0
    '''

## 結果

アンダースコアやアスタリスクが表示されるようになった

## conceal とは

<https://vim-jp.org/vimdoc-ja/syntax.html#conceal>

### conceallevel

>     0               テキストは通常通り表示される
>     1               各ブロックの Conceal されたテキストは一つの文字に置換
>                     される。構文アイテムに代理文字 (:syn-cchar 参照) が
>                     指定されていないときは 'listchars' の設定が使われる
>                      (初期設定はスペース)。
>                     文字は "Conceal" 強調グループを使って強調表示される。
>     2               Conceal されたテキストは構文アイテムに指定された代理文
>                     字 (:syn-cchar) として表示される。それが指定されて
>                     いないときは完全に非表示になる。
>     3               Conceal されたテキストは完全に非表示になる。

### concealcursor

>        カーソル行のテキストを Conceal 表示するモードを設定する。現在のモード
>        がこのオプション値に含まれているなら他の行と同様に Conceal 表示され
>        る。
>          n             ノーマルモード
>          v             ビジュアルモード
>          i             挿入モード
>          c             コマンドライン編集 ('incsearch' 用)

<https://mfumi.hatenadiary.org/entry/20140328/1395946070>
<https://qiita.com/xeno14/items/8d1c8f38595337bab7c8>
