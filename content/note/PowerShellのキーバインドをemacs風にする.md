---
title: PowerShellのキーバインドをemacs風にする
date: 2021-05-09T13:07:00+09:00
tags:
- Windows
- PowerShell
lastmod: 2021-05-09T13:07:38+09:00
---

[PowerShellのキーバインドをEmacs風にする【PSReadLine】 - メモ.org](https://maskaw.hatenablog.com/entry/2019/02/08/193256)

<https://github.com/PowerShell/PSReadLine> をインストール

**なお、PowerShell 6+ではすでにインストールされているため、利用設定だけすればよい**

 > 
 > If you are using Windows PowerShell on Windows 10 or using PowerShell 6+, `PSReadLine` is already installed. Windows PowerShell on the latest Windows 10 has version `2.0.0-beta2` of `PSReadLine`. PowerShell 6+ versions have the newer prerelease versions of `PSReadLine`.

`notepad $PROFILE` を実行して以下を追記

````ps1
if ($host.Name -eq 'ConsoleHost')
{
    # キーバインドをEmacs風に変更
    Set-PSReadlineOption -EditMode Emacs
}
````
