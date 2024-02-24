---
title: Keyball44 QMKをカスタマイズする
date: "2023-09-03T15:03:00+09:00"
tags:
  - '2023/09/03'
  - keyboard
---
 
[[Keyball44の組み立て|Keyball44]] のキーマップはRemapで書き換えできるので簡単だけど、 [keyballの自動マウスレイヤー](https://note.com/twoboy03/n/n791f11d7f261)を追加するなどよりカスタマイズしたい場合はqmkを自前でビルドする必要がある。

## M1 MacでQMK Firmwareのビルド環境を構築する

[M1 MacにQMK Firmwareのビルド環境を構築してみた - NinthSky Studio](https://ninthsky.hatenablog.com/entry/m1mac_qmk)

基本的にこちらの通りだが、自分用の手順を残しておく。

- Rossetaを使用してTerminal.appを開く
- x86_64用の [[Homebrew]]  をインストール
- QMKと、ビルド時に必要なパッケージを追加

```shell
brew install qmk/qmk/qmk
brew tap osx-cross/avr
brew install avr-gcc arm-none-eabi-gcc
```

- https://github.com/qmk/qmk_firmware.git をclone
- https://github.com/Yowkees/keyball をcloneして、上記の `keyboards` 配下に `qmk_firmware/keyboards/keyball` のシンボリックリンクをはる
```shell
ln -s <keyballのディレクトリ>/qmk_firmware/keyboards/keyball <qmk_firmwareのディレクトリ>/keyboards/
```

- 以下のコマンドでビルド

```shell
# qmk_firmware/keyboards/<キーボード名>/keymaps/<キーマップ名> というディレクトリ構成で、
# make <キーボード名>:<キーマップ名> でビルドできる
$ make keyball/keyball44:default
QMK Firmware 0.20.8
☒ keyball/keyball44: No LAYOUTs defined! Need at least one layout defined in info.json.
Making keyball/keyball44 with keymap default

☒ keyball/keyball44: No LAYOUTs defined! Need at least one layout defined in info.json.
avr-gcc (Homebrew AVR GCC 9.4.0) 9.4.0
Copyright (C) 2019 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

Size before:
   text    data     bss     dec     hex filename
      0   24206       0   24206    5e8e keyball_keyball44_default.hex

Compiling: keyboards/keyball/drivers/pmw3360/pmw3360.c                                              [OK]
Compiling: keyboards/keyball/lib/oledkit/oledkit.c                                                  [OK]
...
Checking file size of keyball_keyball44_default.hex                                                 [OK]
 * The firmware size is fine - 24206/28672 (84%, 4466 bytes free)

````

- ProMicroへの書き込みは [Pro Micro Web Updater](https://sekigon-gonnoc.github.io/promicro-web-updater/index.html) を使用した。参考: [QMKファームウェアの書き込み(Pro Micro Web Updater利用) – 遊舎工房サポートサイト](https://yushakobo.zendesk.com/hc/ja/articles/1500011696701)

これで書き込みができた。

## ファームウェアの設定更新

私の設定はこちら
https://github.com/ikorihn/keyball

- デフォルトのqmkのバージョンが0.18なので、0.20にアップデート
- Remapで設定したキーマップをkeymap.cに書き起こし
- [Automatic Mouse Layer](https://docs.qmk.fm/#/feature_pointing_device?id=pointing-device-auto-mouse) を有効化
- LEDは実装していないため、容量を食うLEDオプションを無効化 
- [scroll snap](https://github.com/Yowkees/keyball/pull/108) (最初のスクロールからスクロール方向を特定して固定する機能) を無効化

## 参考

- [keyballのための はじめてのQMK firmware環境構築 Mac編｜ゆう](https://note.com/yinouet1001/n/n856b45220ad4)
- https://wonwon-eater.com/keyball44/
- https://github.com/kamiichi99/keyball/tree/main/qmk_firmware/keyboards/keyball
