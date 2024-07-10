---
title: Sketchybarを使ってみる
date: 2024-06-05T13:43:00+09:00
tags:
  - Mac
---


公式
[SketchyBar](https://felixkratz.github.io/SketchyBar/)


fontを入れる

```shell
brew install --cask sf-symbols
curl -L https://github.com/kvndrsslr/sketchybar-app-font/releases/download/v2.0.19/sketchybar-app-font.ttf -o $HOME/Library/Fonts/sketchybar-app-font.ttf
curl -L https://github.com/kvndrsslr/sketchybar-app-font/releases/download/v2.0.19/icon_map.lua -o ~/.config/sketchybar/icon_map.lua
```

luaでスクリプトを書くためのヘルパー

```shell
# SbarLua
(git clone https://github.com/FelixKratz/SbarLua.git /tmp/SbarLua && cd /tmp/SbarLua/ && make install && rm -rf /tmp/SbarLua/)
```


## 設定

[Share your plugins · FelixKratz/SketchyBar · Discussion #12 · GitHub](https://github.com/FelixKratz/SketchyBar/discussions/12?sort=top) を参考に、適宜設定を追加していく

[GitHub - crissNb/Dynamic-Island-Sketchybar: Dynamic Island on iPhone 14 Pro implementation on Mac using Sketchybar](https://github.com/crissNb/Dynamic-Island-Sketchybar/tree/main) が [[Lazy.nvim]] 的な設定のセットなので、これをベースにしてもよさそう



## 参考

- [How To Make An Amazing Custom Menu Bar For Your Mac With Sketchybar](https://www.josean.com/posts/sketchybar-setup)
- [dotfiles/sketchybar at main · Nanamiiiii/dotfiles · GitHub](https://github.com/Nanamiiiii/dotfiles/tree/main/sketchybar)