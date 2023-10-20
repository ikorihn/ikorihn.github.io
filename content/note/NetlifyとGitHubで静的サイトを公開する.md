---
title: NetlifyとGitHubで静的サイトを公開する
date: 2021-05-03T23:28:00+09:00
tags:
- blog
- frontend
---

## Netlifyの初期設定とデプロイ

[Netlify](note/Netlify.md) にアカウント作成、ログイン(特に難しい手順はないので割愛)

### GitHubとの連携

GitHubと連携する場合、Netlifyのアカウント設定でGitHubアカウントと連携しておく

1. <https://app.netlify.com/> から `New site from Git` をクリック
1. `Continuous Deployment` で GitHubを選択
1. 公開対象リポジトリを選択
1. 対象ブランチ、デプロイ時に実行するbuildコマンド、公開対象のディレクトリを設定
1. `Deploy Site` をクリックするとデプロイされる

### サイト名変更

Site Settings > General > Change site name で変更

### サイト更新

設定したブランチにpushすると自動で更新される
