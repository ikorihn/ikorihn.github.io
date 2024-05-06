---
title: 巨大なGitリポジトリを高速にcloneする技術
date: 2024-04-09T18:16:00+09:00
tags:
  - git
---

gitリポジトリに大きなファイルは極力コミットしないようにすべきだがやむを得ずコミットしたり

本当に軽量化したければ、やってもよい状況であれば過去改変する [[gitリポジトリの軽量化のためにやったこと]] 

## reference repositoryを活用する

gitにはすでにclone済みのローカルリポジトリを参照する機能がある

```shell
$ git clone --mirror ${REPOSITORY} /path/to/cache/${REPOSITORY}
```

```shell
$ git clone --reference-if-able=/path/to/cache/${REPOSITORY} ${REPOSITORY}
```

mirrorしたリポジトリは、定期的に `git remote update` を実行することで参照元に追従させておく。


## LFSのローカルキャッシュディレクトリを指定する

git-lfs を使っている場合

通常であれば、`.git` ディレクトリ配下にオブジェクトがダウンロードされる。
そうするとgit cloneのたびにLFSオブジェクトもダウンロードされるのでキャッシュディレクトリを永続化することで回避する。

```shell
# git cloneと同時にlfs pullをしない
GIT_LFS_SKIP_SMUDGE=1 git clone ${REPOSITORY}

cd ${REPOSITORY}
git config --local lfs.storage "/path/to/cache/"
git lfs pull
```

## 参考

- [大きなGitリポジトリをクローンするときの工夫を図解します - DeNA Testing Blog](https://swet.dena.com/entry/2021/07/12/120000)
- [巨大なリポジトリのJenkinsからCircleCIへの移行においてshallow cloneとsparse checkoutで前処理を高速化する - Mobile Factory Tech Blog](https://tech.mobilefactory.jp/entry/2019/12/26/160000)
