---
title: Manjaro Linuxをインストールする
date: 2024-01-02T21:43:00+09:00
tags:
  - Linux
  - Windows
---

Windows 10 を入れているデスクトップPCが、Windows 11には対応していない。
2025年10月にはサポートが切れてしまうため、ほとんど使ってもいないのでいっそLinuxを入れてみるかということでやっていく

インストール候補は [[Ubuntu]] や [[Linux Mint]]  くらいが手頃かなと思ったが、せっかくなら面白そうなのにしようということで、[[Arch Linux]] の中でもとっつきやすいという [[Manjaro Linux]] にしてみる。

このあたりを参考にさせてもらいつつ進める。
- [Web開発環境をManjaro Linuxで構築してみる 1/3 (Linuxのダウンロード~インストール)](https://note.milldea.com/posts/installlinuxpc_01)
- [Manjaro Linux 最初の一歩 #Linux - Qiita](https://qiita.com/phoepsilonix/items/b287aacf2de0ee89681b)


## ISOをUSBメモリに焼く

[公式サイト](https://manjaro.org) から好きなイメージをダウンロードする。
自分はGNOMEにしてみた。XfceやPlasmaと比べると重いみたいだけど、スペック的には困ってないしあんまりシンプルすぎて家族が使えないと困るため。

[Rufus](https://rufus.ie/ja/) を使ってUSBにダウンロードしたISOを焼く。

## BIOS設定にはいる

PCを再起動して、最初の画面でDelかF2を押してBIOSの画面に入る。

ここで、署名されていないBootを実行することができないというエラーがでたため、セキュアブートを無効化する。
ASUSなのでこちらに従い、 [[UEFI]] BIOS Utility からBootの設定で OS Type を `Other OS` に変更して無効化した
[[マザーボード] セキュアブートの有効／無効を設定する方法 | サポート 公式 | ASUS 日本](https://www.asus.com/jp/support/FAQ/1049829/)
