---
title: Jenkinsでraw htmlを説明文に書けるようにする
date: 2022-01-25T23:08:00+09:00
tags:
- Jenkins
---

htmlタグがエスケープされずに装飾できるようになる

[OWASP Markup Formatter](https://plugins.jenkins.io/antisamy-markup-formatter/) をインストール

グローバルセキュリティの設定 > マークアップ記法 > Safe HTML に変更
