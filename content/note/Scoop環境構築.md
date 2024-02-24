---
title: Scoop環境構築
date: "2021-05-05T20:51:00+09:00"
tags: ['Windows']
---

Windows用のパッケージマネージャ。Homebrewのようなもの。
<https://scoop.sh/>

## Chocolateyとの比較

- [winget、Chocolatey、scoop の比較と開発環境の構築自動化 - Nodachisoft](https://nodachisoft.com/common/jp/article/jp000009/)
- [Windows開発環境の構築をChocolateyからscoopに切り替える - tech.guitarrapc.cóm](https://tech.guitarrapc.com/entry/2019/12/01/233522)

Chocolateyの場合、管理者権限が必要なことと、アンインストールが不安定らしい

ScoopはLinuxbrew的にユーザーディレクトリにインストールし、UAC不要、PATHが汚れないなど

## Scoopアプリのインストール先

scoop でインストールされたアプリは、基本的に `~\scoop\shims\アプリ名.EXE` のパスに存在します。shims でわかる通り、これらは `~/scoop/apps/アプリ名/current` を参照しており、アプリケーションのインストールと利用が分離されています。

## Chocolateyのアンインストール

Chocolateyを普通にアップグレードしようとしたが、
`choco list --local-only` で2,3個しかパッケージを入れていなかったので、それらを削除してChocolatey自身もアンインストールすることにした

<https://docs.chocolatey.org/en-us/choco/uninstallation>

1. packageの削除

```sh
choco list --local-only
choco uninstall python3
```

2. 環境変数の削除

ChocolateyInstall だけ設定されていたので削除

3. Chocolateyの削除

`C:\ProgramData\chocolatey` のフォルダごと削除

## Scoopのインストール

<https://scoop.sh/> の手順を実施

PowerShellを開いて(not 管理者権限)以下をたたく

```sh
> Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
Initializing...
Downloading scoop...
Extracting...
Creating shim...
Downloading main bucket...
Extracting...
Adding ~\scoop\shims to your path.
'lastupdate' has been set to '2021-05-05T17:07:43.6803091+09:00'
Scoop was installed successfully!
Type 'scoop help' for instructions.
```

これだけで完了

パッケージをインストール

```sh
scoop install git
```

## Extras Bucketを追加する

<https://github.com/lukesampson/scoop-extras>

```sh
scoop bucket add extras
scoop install autohotkey
```

