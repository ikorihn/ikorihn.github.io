---
title: Windows デュアルブートしているubuntuを削除
date: 2023-05-05T20:34:00+09:00
tags:
- Linux
- Windows
---

[LinuxとWindowsのデュアルブートをやめた](note/LinuxとWindowsのデュアルブートをやめた.md)

````sh
C:\>bcdedit /enum firmware

ファームウェアのブート マネージャー
--------------------------------
identifier              {fwbootmgr}
displayorder            {1b24c802-09c6-11e6-9bf5-806e6f6e6963}
                        {bootmgr}
                        {7760eed9-aced-11eb-9c79-806e6f6e6963}
timeout                 2

Windows ブート マネージャー
--------------------------------
identifier              {bootmgr}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\Microsoft\Boot\bootmgfw.efi
description             Windows Boot Manager
locale                  ja-JP
inherit                 {globalsettings}
default                 {current}
resumeobject            {7089dc6c-401f-11e9-994c-cb5d728b39c4}
displayorder            {current}
toolsdisplayorder       {memdiag}
timeout                 30

ファームウェア アプリケーション (101fffff
--------------------------------
identifier              {1b24c802-09c6-11e6-9bf5-806e6f6e6963}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\ubuntu\shimx64.efi
description             ubuntu

ファームウェア アプリケーション (101fffff
--------------------------------
identifier              {7760eed9-aced-11eb-9c79-806e6f6e6963}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\Ubuntu\grubx64.efi
description             ubuntu
````

削除

````
C:\>bcdedit /delete {7760eed9-aced-11eb-9c79-806e6f6e6963}
この操作を正しく終了しました。

C:\>bcdedit /enum firmware

ファームウェアのブート マネージャー
--------------------------------
identifier              {fwbootmgr}
displayorder            {1b24c802-09c6-11e6-9bf5-806e6f6e6963}
                        {bootmgr}
timeout                 2

Windows ブート マネージャー
--------------------------------
identifier              {bootmgr}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\Microsoft\Boot\bootmgfw.efi
description             Windows Boot Manager
locale                  ja-JP
inherit                 {globalsettings}
default                 {current}
resumeobject            {7089dc6c-401f-11e9-994c-cb5d728b39c4}
displayorder            {current}
toolsdisplayorder       {memdiag}
timeout                 30

ファームウェア アプリケーション (101fffff
--------------------------------
identifier              {1b24c802-09c6-11e6-9bf5-806e6f6e6963}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\ubuntu\shimx64.efi
description             ubuntu

C:\>bcdedit /delete {1b24c802-09c6-11e6-9bf5-806e6f6e6963}
この操作を正しく終了しました。

C:\>bcdedit /enum firmware

ファームウェアのブート マネージャー
--------------------------------
identifier              {fwbootmgr}
displayorder            {bootmgr}
timeout                 2

Windows ブート マネージャー
--------------------------------
identifier              {bootmgr}
device                  partition=\Device\HarddiskVolume1
path                    \EFI\Microsoft\Boot\bootmgfw.efi
description             Windows Boot Manager
locale                  ja-JP
inherit                 {globalsettings}
default                 {current}
resumeobject            {7089dc6c-401f-11e9-994c-cb5d728b39c4}
displayorder            {current}
toolsdisplayorder       {memdiag}
timeout                 30

````

````sh
C:\>diskpart

Microsoft DiskPart バージョン 10.0.17763.1

Copyright (C) Microsoft Corporation.
コンピューター: DESKTOP-3HKIQ1T

DISKPART> list disk

  ディスク      状態           サイズ   空き   ダイナ GPT
  ###                                          ミック
  ------------  -------------  -------  -------  ---  ---
  ディスク 0    オンライン           119 GB      0 B        *
  ディスク 1    オンライン           465 GB  1024 KB        *

DISKPART> sel disk 0

ディスク 0 が選択されました。

DISKPART> list vol

  Volume ###  Ltr Label        Fs    Type        Size     Status     Info
  ----------  --- -----------  ----  ----------  -------  ---------  --------
  Volume 0     E                       DVD-ROM         0 B  メディアなし
  Volume 1     C   Windows      NTFS   Partition    118 GB  正常         ブート
  Volume 2         SYSTEM       FAT32  Partition    100 MB  正常         システム
  Volume 3     D                NTFS   Partition    215 GB  正常

DISKPART> sel vol

ボリュームが選択されていません。

DISKPART> sel vol 2

ボリューム 2 が選択されました。

DISKPART> assign letter=Z

DiskPart はドライブ文字またはマウント ポイントを正常に割り当てました。

DISKPART> exit

DiskPart を終了しています...
````

````
C:\>cd /d Z:\

Z:\>dir
 ドライブ Z のボリューム ラベルは SYSTEM です
 ボリューム シリアル番号は 7221-A80F です

 Z:\ のディレクトリ

2017/04/08  23:28    <DIR>          EFI
               0 個のファイル                   0 バイト
               1 個のディレクトリ      68,054,016 バイトの空き領域

Z:\>cd EFI

Z:\EFI>dir
 ドライブ Z のボリューム ラベルは SYSTEM です
 ボリューム シリアル番号は 7221-A80F です

 Z:\EFI のディレクトリ

2015/11/24  15:41    <DIR>          .
2015/11/24  15:41    <DIR>          ..
2015/11/24  15:41    <DIR>          Microsoft
2021/05/04  23:45    <DIR>          Boot
2021/05/04  23:45    <DIR>          ubuntu
               0 個のファイル                   0 バイト
               5 個のディレクトリ      68,054,016 バイトの空き領域

Z:\EFI>rmdir /s ubuntu
ubuntu、よろしいですか (Y/N)? y

Z:\EFI>dir
 ドライブ Z のボリューム ラベルは SYSTEM です
 ボリューム シリアル番号は 7221-A80F です

 Z:\EFI のディレクトリ

2015/11/24  15:41    <DIR>          .
2015/11/24  15:41    <DIR>          ..
2015/11/24  15:41    <DIR>          Microsoft
2021/05/04  23:45    <DIR>          Boot
               0 個のファイル                   0 バイト
               4 個のディレクトリ      71,808,000 バイトの空き領域
````
