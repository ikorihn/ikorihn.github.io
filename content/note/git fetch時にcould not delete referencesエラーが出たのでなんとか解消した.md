---
title: git fetch時にcould not delete referencesエラーが出たのでなんとか解消した
date: 2024-06-27T17:36:00+09:00
tags:
  - git
---
 
## エラー内容

```
❯ git fetch origin
error: could not delete references: cannot lock ref 'refs/remotes/origin/feature/XXXX': Unable to create 'repo/.git/refs/remotes/origin/feature/XXXX.lock': File exists.

Another git process seems to be running in this repository, e.g.
an editor opened by 'git commit'. Please make sure all processes
are terminated then try again. If it still fails, a git process
may have crashed in this repository earlier:
remove the file manually to continue.
```

しかし `.git/refs/remotes/origin/feature/XXXX.lock` というファイルは存在しないので途方にくれた。

## 解消手順

originには `Feature` 始まりのブランチと `feature` 始まりのブランチが混在しており、大元は大文字小文字の混在によりmacで正しく処理ができていないのが原因のように推測した。

方法が正しいかわからないが、以下のようにしたらとりあえず直ったっぽい。ローカルリポジトリが壊れても保証はできません

 ```shell
$ cd .git/refs/remotes/origin
$ ls
Feature hotfix release
# => 大文字始まりのFeatureがある

# 大文字小文字を直す
$ mv Feature tmp && mv tmp feature

$ git remote prune
error: could not delete references: cannot lock ref 'refs/remotes/origin/feature/XXXX': Unable to create 'repo/.git/refs/remotes/origin/feature/XXXX.lock': File exists.
# => まだエラーが出る

# remoteのrefが壊れているみたいなので、update-ref -d で削除する
$ git branch -r | xargs -i git update-ref -d 'refs/remotes/{}'

# ゴミをきれいにする
$ git pack-refs --all
$ git gc --prune=now

$ git fetch origin
# => リモートブランチが正常に再取得された
```


## 参考

- [windows - GitHub Branches: Case-Sensitivity Issue? - Stack Overflow](https://stackoverflow.com/questions/55051729/github-branches-case-sensitivity-issue)
- [What do I do when I get "error: cannot lock ref 'refs/remotes/origin/bug/INC-4649' " while trying to git pull? - Stack Overflow](https://stackoverflow.com/questions/76725546/what-do-i-do-when-i-get-error-cannot-lock-ref-refs-remotes-origin-bug-inc-464)
