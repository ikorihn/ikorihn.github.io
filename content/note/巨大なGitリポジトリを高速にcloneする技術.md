---
title: 巨大なGitリポジトリを高速にcloneする技術
date: 2024-04-09T18:16:00+09:00
tags:
  - git
lastmod: 2024-05-13T12:39:50+09:00
---

Gitリポジトリを長年運用していると、徐々に容量が大きくなっていきがちです。
また、大きなバイナリファイルやnode_modulesをうっかりコミットしてしまって、rebaseするのではなくrevertで削除したものがmainにマージされたりするとどうにもなりません。

やってもよい状況であれば過去を改変してコミットをなかったことにもできますが、影響範囲も大きいのでなかなかできるものでもありません。
ref [[gitリポジトリの軽量化のためにやったこと]] 

shallow cloneに関しては
[パーシャルクローンとシャロークローンを活用しよう - GitHubブログ](https://github.blog/jp/2021-01-13-get-up-to-speed-with-partial-clone-and-shallow-clone/)

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

## Jenkinsの場合

### refspecを指定する

[[Jenkins]] の `checkout` の場合、`branches` で指定した以外のブランチもfetchするため、ブランチが多かったり重いファイルがあるブランチが存在する場合に時間がかかります。
これは `userRemoteConfigs` の `refspec` を指定することで回避できます。
これで対象のブランチのみをfetchするようになります。

```groovy
checkout scm: scmGit(
    branches: [[name: "*/${params.BRANCH}"]],
    extensions: [cloneOption(depth: 1, reference: '', shallow: true)],
    userRemoteConfigs: [[
        credentialsId: 'MY_GIT_CREDENTIALS',
        url: params.SCM_URL,
        refspec: "+refs/heads/${params.BRANCH}:refs/remotes/origin/${params.BRANCH}",
    ]],
)
```


## Sparse checkoutの効果

sparse checkoutは必要なファイルやディレクトリのみをチェックアウトする機能です。

clone時に `--no-checkout` でclone後にファイルを展開されないようにする

```shell
❯ git clone --depth=1 --no-checkout git@github.com/org/bigrepo.git bigrepo_shallow_sparse
```

clone後にディレクトリに入って、 `sparse-checkout set` でチェックアウトする対象を指定して、`checkout` する

```shell
❯ cd bigrepo_shallow_sparse
❯ git sparse-checkout set work_dir
❯ git checkout .
```

サイズを比較するとチェックアウトしていない分容量を節約できています。
しかしこれはあくまでワーキングツリーを展開していないことによる差分で、`Receiving objects` の行を見ればわかるようにダウンロードするサイズは変わっていないことに注意してください。
つまり通信時間は変わりません。

```shell
❯ time git clone --depth=1 git@github.com/org/bigrepo.git bigrepo_shallow
Cloning into 'bigrepo_shallow'...
Receiving objects: 100% (3562/3562), 16.78 MiB | 3.63 MiB/s, done.
Resolving deltas: 100% (1282/1282), done.
Updating files: 100% (6048/6048), done.
git clone --depth=1 git@github.com/org/bigrepo.git  1.20s user 0.94s system 22% cpu 9.448 total

❯ time git clone --depth=1 --no-checkout git@github.com/org/bigrepo.git bigrepo_shallow_sparse
Cloning into 'bigrepo_shallow_sparse'...
Receiving objects: 100% (3562/3562), 16.78 MiB | 2.87 MiB/s, done.
Resolving deltas: 100% (1282/1282), done.
git clone --depth=1 --no-checkout    0.86s user 0.27s system 12% cpu 9.063 total

❯ du -sh ./*
173M    ./bigrepo_shallow
18M     ./bigrepo_shallow_sparse
```


## 参考

- [大きなGitリポジトリをクローンするときの工夫を図解します - DeNA Testing Blog](https://swet.dena.com/entry/2021/07/12/120000)
- [巨大なリポジトリのJenkinsからCircleCIへの移行においてshallow cloneとsparse checkoutで前処理を高速化する - Mobile Factory Tech Blog](https://tech.mobilefactory.jp/entry/2019/12/26/160000)
