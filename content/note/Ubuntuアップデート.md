---
title: Ubuntuアップデート
date: "2021-05-04T21:30:00+09:00"
tags: ['Ubuntu']
---

2年以上起動していなかった [[Ubuntu]] 16.04を20.04にアップデートする。

Windows10とUbuntu 16.04のデュアルブートにしていたのだがそもそもデスクトップをあまり使わなかったので放置されていた。
ゼロからのOS自作入門を始めようと思ったところ、Linux環境が推奨
-> MacからUbuntuにリモートログインして操作できるようにしたい
-> Ubuntuの環境を最新化しないと

16.04 -> 18.04 -> 20.04 と一つずつアップグレードする。

## 事前準備

### 環境

Windows10とUbuntu 16.04のデュアルブート

### バックアップ

万が一の失敗に備えてバックアップをとるべきだが、Ubuntuの方には特に大事なものも入っていないので最悪クリーンインストールしてもいいや精神でとらなかった

## パッケージアップデート

```sh
sudo apt update
sudo apt upgrade
```

### apt udpateで/var/lib/apt/lists/lockが取得できない

```sh
$ sudo apt update
E: ロック /var/lib/apt/lists/lock が取得できませんでした - open (11: リソースが一時的に利用できません)
E: ディレクトリ /var/lib/apt/lists/ をロックできません
E: ロック /var/lib/dpkg/lock が取得できませんでした - open (11: リソースが一時的に利用できません)
E: 管理用ディレクトリ (/var/lib/dpkg/) をロックできません。これを使う別のプロセスが動いていませんか?
```


```sh
$ sudo rm /var/lib/apt/lists/lock
$ sudo rm /var/lib/dpkg/lock
```

### apt update GPGエラー

2021年時点で2年以上前のUbuntu 16.04を起動して、updateしようとしたときに発生

```sh
$ sudo apt update
W: GPG エラー: http://packages.cloud.google.com/apt cloud-sdk-xenial InRelease: 公開鍵を利用できないため、
以下の署名は検証できませんでした: NO_PUBKEY 6A030B21BA07F4FB
```

#### 原因確認

```sh
$ apt-key list
期限切れ
```

#### 対応

```sh
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys <key id>
```

## OSアップデート

```sh
sudo apt install update-manager-core
```

```sh
sudo do-release-upgrade
```

始まってから1時間くらいかかった

**なお、途中で設定ファイルの差分表示の画面に入ったときハングしてしまったためCtrl-Cしたところ中断してしまい、再度do-release-upgradeしても「再起動してください」としか言われず、再起動するとKernel Panicが発生して起動しなくなってしまった**
重要なものも入っていないし使う機会が減ったので、デュアルブート削除することにした。
[[Windows10とUbuntu16.04のデュアルブート解除]]

### do-release-upgrade で `Please install all available updates for your release before upgrading.` と表示

パッケージをすべてアップグレードしないと、OS アップグレードができないということらしい

#### 原因

`apt upgrade` で保留になっているパッケージがあった。

```sh
$ sudo apt upgrade

以下のパッケージは保留されます:
  google-chrome-stale
```

明示的にアップデート

```sh
$ sudo apt install google-chrome-stable
```

必要でなくなったパッケージを削除してreboot

```sh
$ sudo apt autoremove
$ sudo reboot
```

再起動後、 `sudo do-release-upgrade` したらアップグレードが始まった

### ディスプレイマネージャを尋ねられる

gdm3かlightdmか

[【前】Ubuntu 18.04アップグレード失敗談【アップグレード編】 | 内向型人間の知恵ブログ](https://chromitz.com/20190315-ubuntu-upgrade-failed-story-part1/)
[【Linux入門】ディスプレイマネージャとは？と3分でわかる変更方法](https://eng-entrance.com/linux-displaymanager)

lightdmにした

### grubの設定ファイルについて聞かれる

ローカルで変更加えていると、差分を確認するためにプロンプトが表示される

差分を確認する
新しいバージョンで上書きする
現在のバージョンの設定を引き続き利用する

そのままにしておきたかったので現在の設定を利用するにして続行

状況を検討するための新しいシェルを起動
はCtrl+dで抜けられる

## 参考

- [Ubuntu 16.04 から 18.04にアップグレードする手順 - Memento](https://yoshinorin.net/2018/08/22/ubuntu1604-upgrade-to-1804/)
- [【前】Ubuntu 18.04アップグレード失敗談【アップグレード編】 | 内向型人間の知恵ブログ](https://chromitz.com/20190315-ubuntu-upgrade-failed-story-part1/)
- [ubuntu 18.04 LTS にアップグレードする(コマンドライン編) - Qiita](https://qiita.com/TsutomuNakamura/items/bbd712e3afe5f4bacfac)
- [Ubuntu18.04 LTSから20.04 LTSにdo-release-upgradeした時の問題について - Qiita](https://qiita.com/YasuhiroABE/items/ac28500d7b51e5ebb61b)
