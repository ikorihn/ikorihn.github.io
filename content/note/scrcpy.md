---
title: scrcpy
date: 2023-11-26T12:12:00+09:00
tags:
- Android
---

{{< card-link "https://github.com/Genymobile/scrcpy" >}}

USBやWi-Fiで接続した *Android* 端末をPCで操作できるアプリケーション

*Mac* の場合 [Homebrew](note/Homebrew.md)  でインストールできる。
android Platform-Toolsが入っていなければそれも入れておく

## Wi-Fiで接続する手順

https://github.com/Genymobile/scrcpy/doc/connection.md

デバイスのIPアドレスをなんらかの方法で調べて以下で接続できる

````shell
scrcpy --tcpip=192.168.x.x:5555
````

* [Termux](note/Termux.md) でifconfig
* もしくはUSBでつないで `adb shell ip route`
