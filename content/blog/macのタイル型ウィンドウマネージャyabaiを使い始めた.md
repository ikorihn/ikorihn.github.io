---
title: macのタイル型ウィンドウマネージャyabaiを使い始めた
date: 2024-05-18T17:07:00+09:00
tags:
  - Mac
  - karabiner
---
 
## 背景

以前からタイル型ウィンドウマネージャに興味を持っていました。
今はアプリケーションを雑に重ねて、Karabiner-Elementsを利用してショートカットキーでアプリケーションを切り替えています。
macのデスクトップ機能も活用しておらず、1つのデスクトップにすべてのアプリをおいていました。
ワイドモニターに変えたこともあり、横幅を有効活用するためにウィンドウを敷き詰められるツールを試してみることにしました。

Linuxには [i3-wm](https://i3wm.org) という人気のタイル型ウィンドウマネージャがあります。
このi3-wmに似た機能をmacOSでも利用できる、[yabai](https://github.com/koekeishiya/yabai) というツールを使ってみます。
yabaiは、macOS上でタイル型ウィンドウマネージャを実現するための強力なツールです。この記事ではyabaiのインストールから設定までの手順を紹介します。

## 環境

- MacBook Air M1, 2020 (Sonoma 14.4.1)
- yabai v7.1.0
- Karabiner-Elements 14.13.0

## インストール

[手順はこちら](https://github.com/koekeishiya/yabai/wiki/Installing-yabai-(latest-release))

yabaiを [[Homebrew]] を使ってインストールします。

```sh
brew install koekeishiya/formulae/yabai
```

yabaiを起動し、macOSの起動時に自動的に起動するよう設定します

```sh
yabai --start-service
```

> [!WARNING] 注意
> 以前までは `brew service start` で起動するようになっていましたが現在は `yabai --start-service` に変わっています

なお、[System Integrity Protectionを無効化することでyabaiの全機能を使える](https://github.com/koekeishiya/yabai/wiki/Disabling-System-Integrity-Protection) のですが、セキュリティリスクがあるのでこれは有効なままとしています。

## yabaiの設定

設定ファイルの作成
```sh
mkdir ~/.config/yabai
touch ~/.config/yabai/yabairc
chmod +x ~/.config/yabai/yabairc
```

このファイルに設定を記述します。
- [設定例](https://github.com/koekeishiya/yabai/blob/master/examples/yabairc)
- [リファレンス](https://github.com/koekeishiya/yabai/wiki/Configuration#configuration-file)

設定変更後の再読み込みは `yabai --restart-service` で行います。

### 私の設定

https://github.com/ikorihn/dotfiles/blob/177563ff619000b005f7816dea68b4f49075c811/dot_config/yabai/executable_yabairc

```sh
# 管理対象外にするアプリ
yabai -m rule --add app="^System Settings$" manage=off
yabai -m rule --add app="^Finder$" manage=off
yabai -m rule --add app="^Preview$" manage=off
yabai -m rule --apply

# global settings
yabai -m config \
  external_bar off:40:0 \
  menubar_opacity 1.0 \
  mouse_follows_focus on \
  focus_follows_mouse on \
  display_arrangement_order default \
  window_origin_display default \
  window_placement second_child \
  window_zoom_persist on \
  window_shadow on \
  window_animation_duration 0.0 \
  window_animation_easing ease_out_circ \
  window_opacity_duration 0.0 \
  active_window_opacity 1.0 \
  normal_window_opacity 0.90 \
  window_opacity off \
  insert_feedback_color 0xffd75f5f \
  split_ratio 0.50 \
  split_type auto \
  auto_balance off \
  top_padding 12 \
  bottom_padding 12 \
  left_padding 12 \
  right_padding 12 \
  window_gap 8 \
  layout bsp \
  mouse_modifier fn \
  mouse_action1 move \
  mouse_action2 resize \
  mouse_drop_action swap

echo "yabai configuration loaded.."
```

> [!NOTE]
> v7.0.0からは `yabai -m rule --add` のあとに `yabai -m rule --apply` が必要となっています

## ホットキーを設定

よくyabaiと同じ作者が開発している [skhd](https://github.com/koekeishiya/skhd) を利用してホットキーの設定を行う方法が紹介されていますが、私の場合はもともと使用していた Karabiner-Elements で設定します。

Karabiner-Elementsの設定用DSLの [[Karabiner elementsの設定をGokuで楽に書く|Goku]] を使っています。
https://github.com/ikorihn/dotfiles/blob/master/dot_config/karabiner/karabiner.edn#L232-L255

```json
{
    "description": "Yabai",
    "manipulators": [
        {
            "conditions": [
                {
                    "name": "yabai-mode",
                    "type": "variable_if",
                    "value": 1
                }
            ],
            "from": {
                "key_code": "b"
            },
            "to": [
                {
                    "shell_command": "/opt/homebrew/bin/yabai -m space --balance"
                }
            ],
            "type": "basic"
        },
        {
            "from": {
                "simultaneous": [
                    {
                        "key_code": "y"
                    },
                    {
                        "key_code": "b"
                    }
                ],
                "simultaneous_options": {
                    "detect_key_down_uninterruptedly": true,
                    "key_down_order": "strict",
                    "key_up_order": "strict_inverse",
                    "key_up_when": "any",
                    "to_after_key_up": [
                        {
                            "set_variable": {
                                "name": "yabai-mode",
                                "value": 0
                            }
                        }
                    ]
                }
            },
            "parameters": {
                "basic.simultaneous_threshold_milliseconds": 400
            },
            "to": [
                {
                    "set_variable": {
                        "name": "yabai-mode",
                        "value": 1
                    }
                },
                {
                    "shell_command": "/opt/homebrew/bin/yabai -m space --balance"
                }
            ],
            "type": "basic"
        },
// 他の設定
```

これにより、`yを押しながらb` でウィンドウを並べ直すというキーとなります。
他のキーマップも任意に設定していきます。

## macのデスクトップ切り替えショートカットを設定する

デスクトップ単位でウィンドウが整列されるので、複数のデスクトップに分けるようにします。

- System Setting > Keyboard > Keyboard Shortcuts > Mission Control > Switch to Desktop n を有効にする

デスクトップ切替時のアニメーションは気が散るので、無効化します

- System Setting > Accessibility > Display > Reduce Motion

## まとめ

yabaiを使い始めたばかりなのでまだ評価が難しいですが、キーボードだけでウィンドウをきれいに並べられるのは非常に便利です。
ウィンドウ同士が重ならない、マウスポインタがフォーカスのあたっているアプリケーションに追従するなどアプリケーションの切り替えが高速にできるようになったのと一覧性も高まったため、より早い操作ができるようになったと思います。

## 参考

- [yabai と skhd を最近は利用している - tokuhirom's blog](https://blog.64p.org/entry/2022/06/03/001135)
