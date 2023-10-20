---
title: Obsidianをスマホと同期する
date: 2021-05-02T15:11:00+09:00
tags:
- obsidian
---

[Obsidianとは](note/Obsidianとは.md)

## AndroidとPCでメモを同期する

### 方針

* git,GitHubでvaultを管理する
* Androidでもメモをとってgit管理したい
* daily(YYYY-mm-dd.md)が簡単につくれるといい
* なるべくお金かけずにスタートしたい

### 試したこと

#### Termux

[Using Obsidian with Termux and VIM - The Gadhian](https://www.thegadhian.com/posts/using-obsidian-with-termux-and-vim/)

これすき

 > 
 > I don't really know if it's [zettelkasten](https://zettelkasten.de/posts/overview/#the-introduction-to-the-zettelkasten-method), [evergreen notes](https://notes.andymatuschak.org/Evergreen_notes), or [GTD](https://gettingthingsdone.com/what-is-gtd/), or [bullet journaling](https://bulletjournal.com/). It doesn't really matter.

##### git,vimをインストール

````sh
pkg install vim git
git --version
````

##### storageを使用するためのセットアップコマンド

````sh
termux-setup-storage
````

##### ssh鍵をGitHubに登録

##### vaultリポジトリをクローン

````sh
cd ~/storage/shared
mkdir repos && cd repos
git clone vault
cd vault
git status
````

##### ショートカットを作成

termuxで長いコマンドをうつのは辛いので、よく使うコマンドを登録しておく

~/.bashrc

````sh
export TODAY=$(date +%Y-%m-%d)
export VAULT=~/storage/repos/vault

alias cdv='cd $VAULT'
alias gits='git status'
alias gita='git add .'
alias gitc="git commit -m '$TODAY from termux'"

daily() {
	cp $VAULT/daily/template.md $VAULT/daily/$TODAY.md
	sed -e "s/{{date}}/$NOW/g" -i $VAULT/daily/$TODAY.md
}
````

##### 使い方

daily note

1. termux で `daily` で今日の日付ファイルを作る
1. markor で編集
1. termux で git コマンドでpush

#### Markor

AndroidのMarkdownエディタ

シンプルな機能しか持っていない
ただ書くだけなら便利

#### GitJournal

* GitHubと連携できる
* markdownの編集ができる
* 保存タイミングで自動でpush/pullする

特に難しい設定をせずに使えるのが利点

* 不便な点
  * 同期タイミングを調整できない
  * テンプレートが利用できない
