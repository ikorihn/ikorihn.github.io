---
title: termuxとGitを使って、ObsidianをPCとAndroidで同期する方法
date: 2024-08-09T16:13:00+09:00
tags:
  - obsidian
---
 
みなさんはObsidianを複数のデバイスでどのように同期していますか？
有料だが公式の[Obsidian Sync](https://obsidian.md/sync)？無料のDropboxやGoogle Driveなどのクラウドストレージ？

私の場合はバージョン管理がしたかったのと、どの端末からも一番アクセスしやすかったのがGitHubだったこともあり、Obsidian Gitを使って同期をしています。
しかし[モバイルではIsomorphic GitというJavaScript実装のGitを使用している](https://github.com/Vinzent03/obsidian-git?tab=readme-ov-file#mobile)ため、いろいろ制限があります。

- SSH認証がサポートされていない
- リポジトリサイズ制限
- rebaseによるマージが行えない
- submoduleがサポートされていない

この記事では [[Termux]] とGitを使って私がどのようにモバイル端末と同期しているかについて紹介します。

## モバイル端末ではどうやって・なんのためにObsidianを使っているか

本題に入る前に、モバイルではどのようにObsidianを利用しているかを説明します。
[Obsidian Mobile](https://obsidian.md/mobile) を使っています。

スマホで長文を書くのは疲れるので、なにかノートを書くというよりは、[Thino](https://github.com/Quorafind/Obsidian-Thino) でメモを取るのに使用しています。
これはDailyノートにタイムスタンプ付きで追記してくれるので、ちょっとしたメモや思いつきを書くのにうってつけです。
SNSの鍵付きアカウントに書く代わりに使っているイメージです。オフラインで書けて、広告も見なくていいのが利点です。

## 環境

- Android
    - Termux 0.118.1

Obsidian vaultはすでにGitHub上に作成済みのものとします。

## Termuxのインストール

Google Play Store版のTermuxは、ちょっと前まで非推奨とされていたり、2024年現在も[experimental](https://github.com/termux/termux-app?tab=readme-ov-file#google-play-store-experimental-branch) なため、 [F-Droid](https://f-droid.org/en/packages/com.termux/) からインストールします。

### Termuxの初期設定

Termuxを開いて、利用するパッケージをインストールします。

```shell
$ pkg update
$ pkg install -y vim git openssh
```

## TermuxからGitHubにpush/pullするためのセットアップ

https、sshどちらでも可ですが、私はsshでやり取りしています。
鍵の生成やGitHubへの公開鍵の登録などは一般的な内容なので割愛します。
`openssh` を入れていればTermuxでed25519などの鍵の生成が行えます。

## Obsidian vaultをセットアップ

Obsidian Mobile等、Termux以外のアプリでvaultにアクセスするためには、Androidの共有ストレージ上にvaultをcloneする必要があります。
ここではその方法を説明します。

TermuxでAndroidの共有ストレージ(`/sdcard` や `/storage/emulated/0`)を使用するために許可を与えます。

https://wiki.termux.com/wiki/Termux-setup-storage

```sh
$ termux-setup-storage
```

すると `~/storage/shared` で共有ストレージにアクセスできるようになります。

### vaultリポジトリをクローン

```sh
$ cd ~/storage/shared
$ mkdir repos && cd repos
$ git clone git@github.com:<vault repository>.git
$ cd vault
$ git status
$ git config --local user.email '<your email>'
$ git config --local user.name '<your name>'
$ git status
```

### Obsidian Mobileで開く

`Open folder as vault` で、`repos/<repository>` を開く

## cronで定期的に同期する


cronデーモンである[cronie](https://github.com/cronie-crond/cronie)と、serviceとして起動するためのパッケージをインストールします。

```shell
$ pkg install cronie termux-services
```

serviceに登録します

```shell
$ sv-enable crond
```

crontabに定期実行スケジュールを登録します。

```shell
$ crontab -e

# 任意の感覚で同期する
*/10 * * * * ~/sync_obsidian.sh
```

`~/sync_obsidian.sh` の中身は以下の通りです。

```shell
#!/data/data/com.termux/files/usr/bin/bash

REPO=<repository>
cd $HOME/storage/shared/repos/${REPO}

git pull --autostash --rebase

git add -A
git commit -m "$(date +'%Y-%m-%d %H:%M:%S') from termux"

git push
```

> [!INFO]
> Termuxアプリを終了するとcronも実行されないため、バックグラウンドで起動しておく必要があります。これにより電池消費が増える可能性がありますが、自分の体感ではとくに問題にはなっていません。

これで、Android上でも定期的にgit pull, git pushが行われるようになりました！

## Termux上での操作を便利にするコマンド集

スマホ上で毎回長いshellコマンドを打つのは疲れるので、よく使う操作は関数やaliasにしています。

### リポジトリのディレクトリに移動

```shell
cdm() {
  cd ~/storage/shared/<path/to/repo>
}
```

### 現在時刻をメッセージにいれてコミット

```shell
gic() {
    git commit -am "$(date +"%Y-%m-%d %H:%M:%S") from termux"
}
```

### リポジトリ再作成

まれに `.git/index.lock` がロックされてなんの操作も受け付けなくなることがあるので、再作成を一発で行えるようにしています

```shell
recreaterepo() {
    rm -rf .git
    git init
    git remote add origin git@github.com:<repo_name>.git
    git fetch origin
    git switch -f master
}
```