---
title: Jenkinsジョブでgit-lfsを使用して一部だけpullしたい
date: "2021-02-19T18:26:00+09:00"
lastmod: '2021-05-30T18:50:35+09:00'
tags:
  - 'Jenkins'
  - 'git'
---


# Jenkinsとgitlfs

## やりたいこと

Jenkinsのgit pluginで一部だけgit lfs pullしたい

## わかっていること

-   `git lfs pull -I "$target"` で対象のディレクトリ・ファイルだけダウンロードできる
-   `git lfs install --skip-smudge` しておかないと、最初のcheckoutで全部`git lfs pull`しようとするっぽい
-   JenkinsのGit Pluginがcloneするより前に `git lfs install --skip-smudge`

## 結果

- JenkinsのGit Pluginによるチェックアウトは無効にする
- shellで lfs pull する

```shell
# Git Pluginのcloneだと、git lfs pullをスキップできないので、事前に--skip-sumudgeを設定してから手動でcloneする
git init
git lfs install --skip-smudge --local
git remote add origin <repository>
git pull origin master

# 対象ディレクトリのみlfs pullすることで時間短縮、容量削減
git lfs pull -I "$targetIn"
```
