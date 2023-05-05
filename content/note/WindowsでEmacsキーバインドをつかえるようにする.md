---
title: WindowsでEmacsキーバインドをつかえるようにする
date: 2022-03-06T18:17:00+09:00
tags:
- Windows
- AutoHotKey
- Keyboard
---

[Windows 10でも「Emacs風キーバインド」を使おう【AutoHotKey】 | LFI](https://linuxfan.info/windows-emacs-keybindings)
<https://github.com/lintaro-jp/gtk-emacs-theme-like.ahk>
を使うとemacs風のカーソル移動、文字削除ができるようになる

ショートカットキーがよくぶつかるので、適用したくないアプリケーションは以下のやり方で対象でなくする

[\[AutoHotKey\]\#IfWinActiveで対象ウインドウを指定する](https://pouhon.net/ahk-win-active/2812/)

````ahk
#IfWinActive,ahk_exe chrome.exe ;Chrome.exeがアクティブな時にだけ
    vk1D & E:: ;無変換キー+Eで
    Send,^+b ;ブックマークバーの表示/非表示を切り替える
    Return
#IfWinActive
````
