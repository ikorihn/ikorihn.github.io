---
title: Git hunkのサイズを変更する
date: '2023-04-25T17:39:00+09:00'
tags:
  - '2023/04/25'
  - 'git'
---

`git diff --ignore-matching-lines=<pattern>` で特定のdiffを除外しようとしたがうまくいかず調べたところ、hunk単位でパターンが適用されるらしい。
hunkのサイズを小さくできないかを調べた。

[Can I modify git-add's **default** hunk size? - Stack Overflow](https://stackoverflow.com/questions/33891010/can-i-modify-git-adds-default-hunk-size)

hunk sizeを [diff.context](https://git-scm.com/docs/diff-config#diff-config-diffcontext) で指定できる

```
git config --global diff.context 0

# 実行時のみ
git -c diff.context=0 diff
```
