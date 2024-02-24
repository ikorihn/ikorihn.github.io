---
title: "Karabiner-Elementsで個人的におすすめのキーバインド"
date: "2021-08-15T19:00:00+09:00"
updated-date: "2021-08-15T19:00:00+09:00"
description: "Macのキーバインドをカスタマイズする"
tags: ["Mac", "keyboard"]
---

```toc
# This code block gets replaced with the TOC
```

## Karabiner-Elements とは

Macのキーボードをカスタマイズするためのツールです。
これを使えばUSキーボードでもJIS配列のようにかな/英数キーを割り当てるなどが可能になります。

ここでは個人的に使っているキーバインドを紹介します。
インストールや設定方法については色々なサイトで紹介されているので省略します。

ルールについては <https://ke-complex-modifications.pqrs.org/> から探すことができます。
Karabiner-ElementsのPreferences -> Complex modifications -> Import more rules from the Internet から飛べます。

![[blog/2021-08-15-16-28-21.png|2021-08-15-16-28-21]]

## Change spacebar to left_shift if pressed with other keys (Post spacebar when pressed alone)

[Change spacebar](https://ke-complex-modifications.pqrs.org/#spacebar)

スペースキーにShiftを割り当て、スペースキー単独で押したときにはスペースが入力されます。
いわゆる `SandS (Space and Shift)` というものです。

特にShift+数字の入力が遠く感じてミスが多かったのが、かなり改善されました。

注意としては、スペース押しっぱなしにしても1つしか入力されないので、連続入力したい場合連打が必要になります。

## Post escape if left_control is pressed alone

[Change control key](https://ke-complex-modifications.pqrs.org/#control)

Ctrlキーを単独で押したときにECSが入力されます。

自身がvimmerであり、vim以外のエディタにもvimキーバインドを設定しているので、ECSをよく押すのですが、
指を動かす距離が減って楽になりました。

vimでECSを `jj` や `C-[` などにバインドしている人や、vimmer以外には恩恵を感じにくいかもしれません。

## Quit application by holding command-q

[Prevent unintended command-q (rev 2)](https://ke-complex-modifications.pqrs.org/#command_q)

Cmd+q を長押しでアプリケーションを終了するようになります。

タブを閉じようとしてしょっちゅう `Cmd+w` と `Cmd+q` を打ち間違えるため導入しました。

## コマンドキーを単体で押したときに、英数・かなキーを送信する。（左コマンドキーは英数、右コマンドキーはかな）

[For Japanese （日本語環境向けの設定）](https://ke-complex-modifications.pqrs.org/#japanese)

記号の配置の好みや、リターンキーの押しやすさからUS配列を使用しています。
US配列のキーボードでは、英数やかなのキーがなく、日本語切り替えは `Cmd+Space` や `Ctrl+Space` で行います。

切り替えの場合、現在の入力状態を把握している必要があるので、できればJIS配列と同じように単一のキーを押すと必ず英数/ローマ字入力に変わってほしいところです。

この設定を行うと、左Commandが英数キー、右Commandがかなキーに割り当てられます。
Commandのmodifierとしての機能は維持され、コピーやペーストなどのショートカットも利用できます。

## Vonng/Capslock

<https://github.com/Vonng/Capslock>

CapsLockキーを、いろいろなことができるmodifierに変化させる設定です。
*Make CapsLock Great Again!* と銘打つだけあって、アプリ起動のホットキーを作ったり、矢印キーでマウスカーソルを移動させたりといったことができるようになります。

`karabiner://karabiner/assets/complex_modifications/import?url=https://vonng.com/capslock.json` からインストールできます。

### Application

アプリケーション起動のホットキーを登録できます。
例: `CapsLock+e` でSafariが起動する(起動済みだったらウィンドウが切り替わる)

Cmd+Tabでアプリを切り替えたり、Mission ControlやDockで探したりといった手間がなくなります。

私はkarabinerの設定ファイル(`~/.config/karabiner/karabiner.json`) を書き換えて、よく使うアプリを左手のキーに登録しています。

- `CapsLock+s`: Slack
- `CapsLock+g`: Chrome
- `CapsLock+v`: Visual Studio Code
- `CapsLock+f`: iTerm2
- `CapsLock+Cmd+f`: Finder

### Functional

`CapsLock+数字列` をFunctionキーにします。
Functionキーのないキーボードを使っている場合に便利です。

### Navigation

Vimスタイルの移動が可能になります。どんな場所でも `hjkl` で移動できるようになります。
ほかにも `u` が `PgUp`、`i` が `Home` になったり、
`CapsLock+Opt+hjkl` がマウスカーソル移動になったりします。
