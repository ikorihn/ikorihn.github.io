---
title: gitリポジトリの軽量化のためにやったこと
date: "2021-05-21T12:43:00+09:00"
lastmod: '2021-05-21T13:00:52+09:00'
tags:
  - 'git'

---

#git

リポジトリの軽量化をしたい。
今あるファイルを消すだけではリポジトリサイズは減らない。
自由にしていいリポジトリであれば、gitの履歴を改変する、LFS化するなどする。

## git-lfs をインストールする

1.  [https://git-lfs.github.com/](https://git-lfs.github.com/ "https://git-lfs.github.com/")
    1.  macの場合

```shell
$ brew install git-lfs
$ git lfs install 
$ git lfs version 
git-lfs/2.12.1 (GitHub; darwin amd64; go 1.15.3)
```

## リポジトリ軽量化

過去コミットに残っている巨大ファイルを削除して軽量化する。
git filter-branch を使う方法は、履歴が多いとかなり遅いため実用的じゃなかった。

[BFG](https://rtyley.github.io/bfg-repo-cleaner/)を使うことにした。

-   大きいファイルを削除することができる (<https://support.atlassian.com/bitbucket-cloud/docs/maintain-a-git-repository/>)
-   HEADに存在するファイルは消されないらしいので安心して実行する (<https://rtyley.github.io/bfg-repo-cleaner/#protected-commits:~:text=Your%20current%20files%20are%20sacred>)

1.  <https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar> からjar実行ファイルをダウンロードする
2.  bareリポジトリをクローン

```shell
$ git clone --mirror git://example.com/some-big-repo.git
```

3.  BFGで巨大ファイルを削除

```shell
$ java -jar bfg.jar --strip-blobs-bigger-than 100M some-big-repo.git
```

4.  BFGでコミットはきれいになった状態だがまだ実体は残っているので、きれいにする

```shell
$ cd some-big-repo.git
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

5.  事前にバックアップをとってからpushする(`--mirror` でcloneしているため、リモートのリポジトリのすべてのrefsがアップデートされるためバックアップ推奨)

```shell
$ git push
```

## LFSの設定

[git lfs migrate で Git-LFS 移行したときのメモ](https://nanmo.hateblo.jp/entry/2019/08/31/120008)

BFGでもLFSに変換できるようだ (<https://support.atlassian.com/bitbucket-cloud/docs/use-bfg-to-migrate-a-repo-to-git-lfs/>)
今はBFGよりgit-lfs-migrateを使ったほうがいいようなのでそうする

```shell
# lfs化するファイルを事前調査
$ git lfs migrate info --everything
migrate: Sorting commits: ..., done.
migrate: Examining commits: 100% (4422/4422), done.
*.png 	1.4 GB	5711/5711 files(s)	100%
*.jpg 	672 MB	4431/4431 files(s)	100%

# lfs化
$ git lfs migrate import --include="*.png,*.jpg" --everything

# 現時点でのサイズ
$ du -sh ./*
4.0K	./config
4.0K	./HEAD
 24K	./hooks
4.0K	./info
1.8G	./lfs
2.0G	./objects
4.0K	./packed-refs
204K	./refs

# gc
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive
$ du -sh ./*
4.0K	./config
4.0K	./HEAD
 24K	./hooks
4.0K	./info
1.8G	./lfs
162M	./objects
4.0K	./packed-refs
  0B	./refs

# => lfsができてobjectsのサイズが減っている
```

## 作業全体

```shell
# bareでリポジトリをクローン
$ git clone --mirror git@github.com/bigrepo.git

# 10MB以上のコミットを削除
$ java -jar bfg-1.13.0.jar --strip-blobs-bigger-than 10M bigrepo.git/

Using repo : bigrepo.git

Scanning packfile for large blobs: 51747
Scanning packfile for large blobs completed in 469 ms.
....


# 実体を削除
$ cd bigrepo.git
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive

# lfs化するファイルを事前調査
$ git lfs migrate info --everything
migrate: Sorting commits: ..., done.
migrate: Examining commits: 100% (4422/4422), done.
*.png 	1.4 GB	5711/5711 files(s)	100%
*.jpg 	672 MB	4431/4431 files(s)	100%

# lfs化
$ git lfs migrate import --include="*.png,*.jpg" --everything

# 現時点でのサイズ
$ du -sh ./*
4.0K	./config
4.0K	./HEAD
 24K	./hooks
4.0K	./info
1.8G	./lfs
2.0G	./objects
4.0K	./packed-refs
204K	./refs

# gc
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive
$ du -sh ./*
4.0K	./config
4.0K	./HEAD
 24K	./hooks
4.0K	./info
1.8G	./lfs
162M	./objects
4.0K	./packed-refs
  0B	./refs

# => lfsができてobjectsのサイズが減っている

$ git push


```
