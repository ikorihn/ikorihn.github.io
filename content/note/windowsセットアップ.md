---
title: windowsセットアップ
date: 2021-05-09T13:04:00+09:00
tags:
- Windows
---

久々にWindowsを起動してアップデートもろもろしたのでメモ

## Windowsアップデート

1909のままになっていた
2021/05/11でサポート終了するので、最新の20H2にアップデートする
[Windows 10 Home and Pro | Microsoft Docs](https://docs.microsoft.com/ja-jp/lifecycle/products/windows-10-home-and-pro)

### 手動アップデート

Windows Updateで更新のチェックをしても出てこなかったので、手動でアップデートする

<https://www.microsoft.com/ja-jp/software-download/windows10> から今すぐアップデートをクリックして更新アシスタントをダウンロード

更新アシスタントを起動してアップデート

## CapsLockをCtrlキーにする

[CapsLockキーって使ってますか？あまり使わないならCtrlキーと交換、あるいはCtrlキーに変えてしまいましょう | IT業務で使えるプログラミングテクニック](https://kekaku.addisteria.com/wp/20180531022629)

`caps2ctrl_swap.reg`

````reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"Scancode Map"=hex:00,00,00,00,00,00,00,00,03,00,00,00,1d,00,3a,00,3a,00,1d,00,00,00,00,00
````

## ChocolateyではなくScoopをつかって環境構築

[Scoop環境構築](note/Scoop環境構築.md)

### Scoop以外でいれたもの

* Visual Studio Code
* Google Chrome

## キーボード配列を変更

US配列に慣れてしまったので、日本語配列のキーボードを使用しているがレイアウトはUSとして使用する。
設定 > 時刻と言語 > 言語 > 日本語 > オプション > ハードウェアキーボードレイアウト > レイアウトを変更する > 英語キーボード(101/102キー)

### 日本語キーボードでUS配列を設定しGoogle日本語入力を使用しているときに、Ctrl+Spaceで全角/半角を切り替える

[Google入力を英語配列キーボードで使っている人向け日本語入力切り替えの変更方法｜システムエンジニアの技術LOG](https://ko-log.net/tech-log/archives/3826932.html)

1. タスクバーの右下にあるIMEを右クリックしてプロパティを開く
1. キー設定の選択 > 編集
1. 入力キーが `Hankaku/Zenkaku` の行を選択して、 `Hankaku/Zenkaku` をダブルクリックするとキー入力のダイアログが表示される
1. Ctrl Space キーを押す
1. これをHankaku/Zenkakuの全項目に繰り返す
1. Ctrl+Spaceで切り替えられるようになる

### 英語レイアウトで変換キーをIMEのON、無変換キーをIMEのOFFにする

Ctrl+Spaceキーはトグルなので、現在の状態を確認せねばならず煩わしい。
Macのかな/英数キーのようなことをしたい。

[WindowsでAX配列を使う - Qiita](https://qiita.com/Big/items/c97573965804fb21ff9e)

Windowsの場合英語レイアウトにすると変換、無変換キーが認識されなくなる。
AX配列にすると認識されるため実現できる。

ただしレジストリの変更を伴うため、自己責任となる。

### Ctrl-n,Ctrl-pで変換候補を選択

\[備忘録的なblog: google日本語入力の候補移動キーの変更\](<http://se-bikou.blogspot.com/2011/04/google.html]>

キー設定 > 編集

|モード|入力キー|コマンド|
|---------|------------|------------|
|変換前入力中|Ctrl n|予測変換|
|変換中|Ctrl n|次候補を選択|
|変換中|Ctrl p|前候補を選択|

## WSL2

<https://docs.microsoft.com/ja-jp/windows/wsl/install-win10#manual-installation-steps>

[WSL/WSL2 インストール (Windows 10でUbuntu) - PS Work](https://pswork.jp/wsl/windows-10-wsl-install/)
Storeでインストールするより手動のほうが場所を決められるのでいいとかいてある
自分もそう思うが、久しぶりに開くとわからなくなりそうなので一旦Storeからのままにしておく

## Windows ターミナル

<https://docs.microsoft.com/ja-jp/windows/terminal/get-started>

Storeからと書いてあるが、Scoopでインストールした

## PATH修正

もとのPATH

````sh
PS C:\Users\ikorihn> $env:Path.Split(";")
D:\app\oracleuser\product\12.1.0\dbhome_1\bin
C:\Program Files\Java\jdk1.8.0_73\bin
C:\Program Files (x86)\Intel\iCLS Client\
C:\Program Files\Intel\iCLS Client\
C:\WINDOWS\system32
C:\WINDOWS
C:\WINDOWS\System32\Wbem
C:\WINDOWS\System32\WindowsPowerShell\v1.0\
C:\Program Files\Intel\Intel(R) Management Engine Components\DAL
C:\Program Files (x86)\Intel\Intel(R) Management Engine Components\DAL
C:\Program Files\Intel\Intel(R) Management Engine Components\IPT
C:\Program Files (x86)\Intel\Intel(R) Management Engine Components\IPT
D:\utils\vim74-kaoriya-win64\
C:\Python36
C:\ProgramData\chocolatey\bin
C:\Users\ikorihn\AppData\Local\atom\bin
C:\Users\ikorihn\AppData\Local\atom\app-1.9.9\resources\app\apm\bin
C:\WINDOWS\system32
C:\WINDOWS
C:\WINDOWS\System32\Wbem
C:\WINDOWS\System32\WindowsPowerShell\v1.0\
D:\utils\Neovim\bin
C:\WINDOWS\System32\OpenSSH\
C:\Users\ikorihn\scoop\shims
C:\Users\ikorihn\AppData\Local\atom\bin
C:\Users\ikorihn\AppData\Local\Microsoft\WindowsApps
C:\Python27\Scripts

C:\Users\ikorihn\AppData\Local\Programs\Microsoft VS Code\bin
````

## 参考

[Windows 10再インストールしたメモ - HackMD](https://hackmd.io/@Eai/Win10-reinstall)
