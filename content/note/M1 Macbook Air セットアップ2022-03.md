---
title: M1 Macbook Air セットアップ2022-03
date: 2022-03-13T11:26:00+09:00
tags:
- Mac
lastmod: 2022-03-13T11:27:00+09:00
---

\#Mac

* US配列

## karbiner

## Obsidian

## defaults

## brew

## IME

## pyenvをやめた

pythonのバージョンを切り替えて使うことがそんなにないので、
特定のバージョンを使いたくなったらdockerを使う

````shell
$ brew install python
$ export PATH="$(brew --prefix)/opt/python/libexec/bin:$PATH" >> ~/.zshrc
````

## Vivaldi

* 検索エンジン、キーマップがいちいちリセットされてしまうのなんとかならんかね

## [Rust](note/Rust.md)

rustupでインストールする
https://www.rust-lang.org/tools/install

````shell
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# もしくは brew install rustup-init && rustup-init 
1を選択
$ rustup --version
=> インストールされていることを確認
````
