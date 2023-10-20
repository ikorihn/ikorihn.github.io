---
title: Windows10とUbuntu16.04のデュアルブート解除
date: 2021-05-05T10:30:00+09:00
tags:
- Windows
- Ubuntu
---

[デュアルブートから Ubuntu を削除する方法 | Windows10 と Ubuntu のデュアルブートからUbuntu を削除し UEFI ブートを修正する方法](https://bi.biopapyrus.jp/os/win/dualboot-fix-bootmenu.html)
を大いに参考にした。

## 確認

Windowsの「システム情報」でBIOSモードがUEFIであることを確認する。
レガシーBIOSの場合は手順が異なる。

デュアルブート時の起動順は、BIOS -> Grub -> Ubuntu or Windowsを選択だった

## bcdeditコマンドでエントリ確認&削除

[bcdeditとは](note/bcdeditとは.md)

コマンドプロンプトを管理者権限で実行

````
$ bcdedit /enum firmware
$ bcdedit /delete {id}
````

## パーティションの操作

````sh
$ diskpart
$ list disk 
UEFIのあるディスクを選択する(disk0)
$ sel disk 0
$ list vol
LABEL:SYSTEM、Fs:FAT32のvolumeを選択
$ sel vol 2
UEFI システムパーテイションを編集できるようにドライブレターを割り当ててマウントする
````

## EFIからubuntuディレクトリを削除

````sh
$ cd /d Z:\
$ dir
$ rmdir /s ubuntu
````

再起動するとGrubが起動せず、Windowsのみブートした

## パーティションの削除、再割り当て

Ubuntuに割り当てていたパーティションを削除する

HDDのメイン領域に割り当てていた250GBとスワップ領域4GBを削除

パーティション上で右クリック→ボリュームの削除で削除できる

削除できたら、Windowsのパーティションでボリュームの拡張をクリック

## 高速スタートアップをもとに戻す

デュアルブートのため無効化していた項目。
もし無効になったままだったら、電源の管理から有効にする

## もし先にパーティションを削除してしまったら

[デュアルブートした環境で先にUbuntuのパーティションを削除してしまったときの話 | (妄想)天使るしふぇちゃんの日記](https://ameblo.jp/lucifep2525/entry-12413328349.html)

Ubuntuを削除するときは先にブート構成データ(BCD)を変更して Ubuntuのブートエントリを削除してからパーティションを削除する。
先にUbuntuのパーティションを削除してしまうと、最悪windowsが起動しなくなり、頑張って修復作業を行う必要が出てくるらしい。

## 参考

* [Windows 10でUbuntu GRUBブートローダーの削除方法 UEFI／レガシーBIOS | 俺の開発研究所](https://itlogs.net/ubuntu-grub-delete-uefi-bios/)
