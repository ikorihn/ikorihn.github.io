---
title: Git でpullしようとしたらfatal cannot lock ref のエラーがでる
date: '2023-05-01T17:17:00+09:00'
tags:
  - '2023/05/01'
  - 'Git'
---

[Jenkinsのgit fetchでCannot lock refエラーが出た時の対応 | by eiryu | Medium](https://medium.com/@eiryu/jenkins%E3%81%AEgit-fetch%E3%81%A7cannot-lock-ref%E3%82%A8%E3%83%A9%E3%83%BC%E3%81%8C%E5%87%BA%E3%81%9F%E6%99%82%E3%81%AE%E5%AF%BE%E5%BF%9C-f112ffd755a6)
[Gitでブランチを作ろうとしたら「fatal: cannot lock ref ...」と怒られた - Qiita](https://qiita.com/ezawa800/items/d2c0ce0b8c47ffae0266)

[[Git]] で `feature/foo` というブランチがある状態で `feature/foo/bar` を作ろうとすると
`error: Cannot lock ref 'refs/remotes/origin/feature/foo/bar': 'refs/remotes/origin/feature/foo' exists; cannot create 'refs/remotes/origin/feature/foo/bar'`  といったエラーが出る。

## 発生手順

- Aが `feature/foo` をpushする
- Bがpullする
- Aが `feature/foo` を消して `feature/foo/bar` をpushする
- Bがpullしようとするときエラーになる

## 対応

`git remote prune` をすれば良い
`git pull --prune` でも良さそう

[[note/Jenkins]] で、Jenkinsfileのclone時に発生した場合は `Additional Behaviours` のところで `Prune stale remote-tracking branches` を指定するとよい。
自分は知らなかったので、Jenkinsfileがクローンされるディレクトリ( `${JENKINS_HOME}/workspace/path/to/job@script` ) を削除するジョブを作っていた。。

![[note/Pasted-image-20230501054721.png|Pasted-image-20230501054721]]

![[note/Pasted-image-20230501054815.png|Pasted-image-20230501054815]]
