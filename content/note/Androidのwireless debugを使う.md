---
title: Androidのwireless debugを使う
date: 2023-12-29T20:40:00+09:00
tags:
- Android
---

[scrcpy](note/scrcpy.md) でワイヤレスデバッグができるが、しばらく時間をおいてから `scrcpy --tcpip=192.168.x.x:5555` をしたら接続できなくなっていて、やり方も忘れてしまったのでもう一回USB接続しないとだめかな？と思ったらAndroid 11以降ではwireless debugが備わっていたのでこちらを使うと良さそうだった。

[Android 11で追加されたワイヤレスデバッグが便利だった](https://zenn.dev/ik11235/articles/android-wireless-debug)

開発者オプションからワイヤレスデバッグを開いて、ペア設定コードでデバイスをペア設定する。
6桁の番号が表示されるので、PC側で入力する

````shell
adb pair 192.168.x.x:nnnn
````
