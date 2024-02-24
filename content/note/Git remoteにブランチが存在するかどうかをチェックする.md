---
title: Git remoteにブランチが存在するかどうかをチェックする
date: '2023-05-01T19:42:00+09:00'
tags:
  - '2023/05/01'
  - 'git'
---

[[Git]] でremoteにブランチが存在するかをチェックするには `git ls-remote` を使う

```shell
REMOTE_NAME=origin
# URLを直接指定してもいい
# REMOTE_NAME=https://github.com/xxx/yyy

BRANCH_NAME=master

if git ls-remote --exit-code $REMOTE_NAME $BRANCH_NAME >/dev/null 2>&1; then
  echo "Branch $BRANCH_NAME exists in remote $REMOTE_NAME."
else
  echo "Branch $BRANCH_NAME does not exist in remote $REMOTE_NAME."
fi
```

- [--exit-code](https://git-scm.com/docs/git-ls-remote.html#Documentation/git-ls-remote.txt---exit-code) 一致するrefsがない場合はexit code 2を返す
- [--head](https://git-scm.com/docs/git-ls-remote.html#Documentation/git-ls-remote.txt---heads) `refs/heads` `refs/tags` のみに限定する

ちなみにローカルのリポジトリで判定する場合はこちら

```shell
if git show-ref --quiet refs/heads/$BRANCH_NAME; then
  echo "Branch $BRANCH_NAME exists."
else
  echo "Branch $BRANCH_NAME does not exist."
fi
```
