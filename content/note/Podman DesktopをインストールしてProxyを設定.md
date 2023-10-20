---
title: Podman DesktopをインストールしてProxyを設定
date: 2023-01-05T12:32:00+09:00
tags:
- 2023/01/05
---

[会社のプロキシの裏でPodman Desktopを実行する | フューチャー技術ブログ](https://future-architect.github.io/articles/20221227a/)

インストール
https://podman-desktop.io/docs/installation/macos-install

実行してInstallを押すとダイアログが出る(0.10.0からこのインストーラー方式に変わった)

![Pasted-image-20230105111356](note/Pasted-image-20230105111356.png)

インストールしてPodmanを起動する

### podman cliをインストール

Podman Desktopからインストールされていそうなのだが見つからなかったのでbrewで別途インストール

````shell
$ brew install podman
````

````shell
$ podman machine ls
NAME                     VM TYPE     CREATED            LAST UP        CPUS        MEMORY      DISK SIZE
podman-machine-default*  qemu        About an hour ago  6 minutes ago  1           2.147GB     107.4GB
$ podman machine info
````

### Proxyを設定

Settings > Proxyから設定する

### Proxyが設定されているのを確認

````shell
$ podman run --rm -it nginx bash

root# echo $https_proxy
=> 設定したproxyが表示される
root# curl '<接続先>'
````
