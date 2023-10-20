---
title: MacでF8を押したときにMusicを起動させないようにする
date: 2021-08-22T17:06:00+09:00
tags: null
---

たまにF8キー(再生)を誤って押してしまい、Apple Music が立ち上がるので防止したい。

[MacでApple Musicが勝手に立ち上がる問題の対処法](https://zenn.dev/catnose99/scraps/9c9858cc2d9f70)

````shell
launchctl unload -w /System/Library/LaunchAgents/com.apple.rcd.plist
````

戻すには以下を実行すれば良さそう。

````shell
launchctl load -w /System/Library/LaunchAgents/com.apple.rcd.plist
````

`launchctl`の`load`と`unload`サブコマンドはレガシーなので、以下のコマンドに置き換えた方が良さそう という意見もあったが、自分の環境(MacBook Air 13-inch, Early 2015, Big Sur 11.5.2)では効かなかった

無効化

````shell
launchctl disable gui/"$(id -u)"/com.apple.rcd
launchctl kill SIGTERM gui/"$(id -u)"/com.apple.rcd
````

有効化

````shell
launchctl enable gui/"$(id -u)"/com.apple.rcd
launchctl kickstart gui/"$(id -u)"/com.apple.rcd
````
