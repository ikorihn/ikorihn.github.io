---
title: Pro Microが文鎮化してしまったので復旧させたい
date: 2024-08-03T21:39:00+09:00
tags:
  - keyboard
---


Pro Micro にUSBを差してもLEDが点灯しなくなってしまった。
分割キーボード( [[Keyball44の組み立て|Keyball44]] )を使っていて、左右にPro Microがあり、片方のPro Microは生きているので、キーボードとしては使えている。
直接USBを差すと反応がないが、TRSケーブル経由で給電するとLEDが光るので、Pro Micro自体が故障しているわけではないらしい。

新しく買ってもいいのだが、せっかく生きているので直せるか調査した。

Pro Microは [TALPKEYBOARDで購入したATmega32U4-MU 5V/16MHz/USB-C(互換品/青)](https://talpkeyboard.net/items/62e24e6f8a0bd07fe2d38137) を使っている。

## 調査

これはArduinoが文鎮化したという状態らしい。

- [Pro Micro(クローン)を文鎮化から復活 #Arduino - Qiita](https://qiita.com/ijikeman/items/52b79254d268b64bd64b)
- [Arduinoのブートローダの修復方法 - Physical Computing FAQ& Tutorial](https://physical-computing-lab.net/arduino/learn_arduino_bootloader_install.html)

生きている方のPro MicroをISPに書き換えて、そこからBootloaderを書き換えるという感じ

## 買ったもの

- ブレッドボード
- ジャンパーワイヤ(オスオス)

## やったこと

ブレッドボードにPro Microを差してみたが、コンスルーが短くて通電しなかった。。。
-> 深めに押し込んでみたら通電した！

ジャンパーワイヤで以下のように接続する

- (ISP <-> 文鎮)
- 14 <-> 14
- 15 <-> 15
- 16 <-> 16
- 10 <-> RST
- VCC <-> VCC
- GND <-> GND

### Arduino IDE

最新(v2.3.2) をインストール
- Tools > Boards > Arduino Uno を選ぶ
- Tools > Programmer > Arduino as ISP(ATmega32U4) を選択
- Burn Bootloader をしたが失敗

```
avrdude: stk500_getsync() attempt 1 of 10: not in sync
```

[Pro Micro ATmega32U4-MU 5V/16MHz/USB-C(互換品/青) | TALP KEYBOARD](https://talpkeyboard.net/items/62e24e6f8a0bd07fe2d38137)
> Supported under Arduino IDE v1.0.1

となっているので、[v1.8をダウンロード](https://www.arduino.cc/en/software/OldSoftwareReleases)
1.0はmacOS 14.5 では起動ができなかった

1.8で起動してみたが書き込み失敗する…
[Mac Book Pro USB port/com issues - LightBurn Software Questions - LightBurn Software Forum](https://forum.lightburnsoftware.com/t/mac-book-pro-usb-port-com-issues/122886)

どうもType-CのUSBではプロトコルのバージョン2.0を矯正する必要がありそう？
そのためにUSB-Aにわざわざ変換しているとか

## 結論 -> 断念した

ここまでやってみたところで、どうしてもBootloaderの書き込みができなかったので、諦めて新しいPro Microを購入した……。
できるようになったほうが面白いと思いつつ、コンスルー込で1200円くらいなのでそこまで頑張らなくてもいいかと
