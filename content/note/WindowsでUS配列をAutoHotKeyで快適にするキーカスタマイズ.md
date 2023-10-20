---
title: WindowsでUS配列をAutoHotKeyで快適にするキーカスタマイズ
date: 2021-05-09T12:21:00+09:00
tags:
- Windows
- AutoHotKey
- Keyboard
---

## Sands

いくつか例があったが自分の環境で動いたのは最後のだけだった

[AutoHotkeyでSandS - Qiita](https://qiita.com/azuwai2/items/e65af02c061ce80ccf91)
[US配列で悠々自適AutoHotkeyScripts](https://blog.phoshigaki.net/2018/10/usautohotkeyscripts.html)

[AutoHotKey で SandS - by edvakf in hatena](https://edvakf.hatenadiary.org/entry/20101027/1288168554)

````ahk
*Space::
  SendInput {RShift Down}
  If SandS_SpaceDown = 1
  {
    Return
  }
  SandS_SpaceDown := 1
  SandS_SpaceDownTime := A_TickCount ; milliseconds after computer is booted http://www.autohotkey.com/docs/Variables.htm
  SandS_AnyKeyPressed := 0
  ; watch for the next single key, http://www.autohotkey.com/docs/commands/Input.htm
  Input, SandS_AnyKey, L1 V,{LControl}{RControl}{LAlt}{RAlt}{LShift}{RShift}{LWin}{RWin}{AppsKey}{F1}{F2}{F3}{F4}{F5}{F6}{F7}{F8}{F9}{F10}{F11}{F12}{Left}{Right}{Up}{Down}{Home}{End}{PgUp}{PgDn}{Del}{Ins}{BS}{Capslock}{Numlock}{PrintScreen}{Pause}
  SandS_AnyKeyPressed := 1
Return

*Space Up::
  SendInput {RShift Up}
  SandS_SpaceDown := 0
  If SandS_AnyKeyPressed = 0
  {
    If A_TickCount - SandS_SpaceDownTime < 200
    {
      SendInput {Space}
    }
    ; Send EndKey of the "Input" command above
    ; You must use Send here since SendInput is ignored by "Input"
    Send {RShift}
  }
Return
````

↑こちらのスクリプトも、Alt+Spaceが効かなくなる問題があったため、記事で紹介されていた <http://lukewarm.s101.xrea.com/up/> の 089 を使用した。

## Altキーを英数/かなに変更

<https://github.com/karakaram/alt-ime-ahk>

alt-ime-ahkをクリックするとAHKが起動する。
常駐したければスタートアップに登録する。

## CtrlとCapsLockをいれかえる

### Caps Lockがなくなってもいいなら

[【Windows10】Caps LockをCtrlに変更 - Qiita](https://qiita.com/peachft/items/1ed0a843817b9caa6aff)

`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout`

新規ファイルでバイナリ値を作成、`Scancode Map`と名前をつけて保存。

````txt
00,00,00,00,00,00,00,00,02,00,00,00,1d,00,3a,00,00,00,00,00
````

regファイルでワンクリックでやるなら
caps2ctrl.reg

````reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"Scancode Map"=hex:00,00,00,00,00,00,00,00,02,00,00,00,1d,00,3a,00,00,00,00,00
````

### 入れ替えるなら

公式に用意されたコマンドを使う

<https://docs.microsoft.com/en-us/sysinternals/downloads/ctrl2cap>

regファイルでやる場合
caps2ctrl_swap.reg

````reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"Scancode Map"=hex:00,00,00,00,00,00,00,00,03,00,00,00,1d,00,3a,00,3a,00,1d,00,00,00,00,00
````

## CapsLockModifier

[US配列で悠々自適AutoHotkeyScripts](https://blog.phoshigaki.net/2018/10/usautohotkeyscripts.html)

````ahk
#InstallKeybdHook
;CapsLockの押し下げを検知
\*CapsLock::
	Suspend, Permit
	isCapsDown := true
	KeyWait CapsLock
	isCapsDown := false
Return

#If isCapsDown == true		;以下のスクリプトはCapsLock押し下げ時のみ
e::Suspend, Off ;Enable hotkeys
d::Suspend, On ;Disable hotkeys

c::sc03A ;CapsLock

q::ExitApp
z::+^#b

;方向キー
i::Up
j::Left
k::Down
l::Right

;ファンクションキー
t::F1
g::F2
b::F3
y::F4
h::F5
n::F6									
m::F7
sc033::F8		;カンマ(,)
.::F9
/::F10

;削除系
u::BackSpace
o::Delete
p::Esc

;default
; | t | y | u | i | o | p |
;  | g | h | j | k | l |
;   | b | n | m | , | . | / |

;CapsLock down
; | F1| F4| BS| ^ |Del|Esc|
;  | F2| F5| < | v | > |
;   | F3| F6| F7| F8| F9|F10|
#If		;以下のスクリプトは文脈に依存しない
````
