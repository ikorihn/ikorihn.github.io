---
title: VoltaでNode.jsのバージョン管理する
date: "2022-05-13T12:18:00+09:00"
tags:
  - 'Nodejs'
---

nvm, nodenv, asdfなどいろいろバージョン管理のツールはあるがころころ移り変わるのが辛い…

現時点では [Volta](https://volta.sh) を使うのがよかった。
インストールしてPATHにいれれば使える。

### インストール

`volta install node@16`

### プロジェクトで使うバージョンを固定する

`volta pin node@16`
=> package.jsonにvoltaの設定が追記される。
開発者全員がvoltaをインストールしていれば、自動で指定されたバージョンのNode.jsがインストールされる
