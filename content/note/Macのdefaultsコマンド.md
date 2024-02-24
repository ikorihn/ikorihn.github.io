---
title: Macのdefaultsコマンド
date: "2021-08-11T11:25:00+09:00"
lastmod: '2021-08-11T11:27:05+09:00'

---

-   [システム環境設定をターミナル（defaultsコマンド）から設定する方法（Mission Control） - OTTANXYZ](https://www.ottan.xyz/posts/2016/07/system-preferences-terminal-defaults-mission-control-4656/)
-   [Mac を買ったら必ずやっておきたい初期設定を、全て自動化してみた](https://zenn.dev/ulwlu/articles/1c3a1da12887ed)
    -   <https://github.com/ulwlu/dotfiles/blob/master/system/macos.sh>
-   <https://github.com/ryuichi1208/dotfiles/blob/master/mac/macos/.macos>

## 現在の設定をすべて取得する

```shell
$ defaults read 

## domainsを使って書く場合
$ LOGFILE=defaults_backup.log
$ defaults domains | sed 's/, /\n/g' | xargs -I % sh -c 'echo % && defaults read %' > $LOGFILE
$ defaults domains --currentHost | sed 's/, /\n/g' | xargs -I % sh -c 'echo % && defaults read --currentHost %' >> $LOGFILE
$ echo NSGlobaDomain >> $LOGFILE && defaults read NSGlobalDomain >> $LOGFILE
```

## 特定の設定を見る

```shell
defaults read .GlobalPreferences_m
```

## 設定を書き込む

```shell
$ defaults write com.apple.dock mru-spaces -bool false
```

### ショートカットキーの変更

ショートカットキーは辞書型になっているので以下のようにする

```shell
# IME切り替えのショートカットをOFFにする
$ defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 61 "<dict><key>enabled</key><false/></dict>"
# Spotlightを`option + command + space`で呼び出せるようにする
$ defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 64 "<dict><key>enabled</key><true/><key>value</key><dict><key>parameters</key><array><integer>32</integer><integer>49</integer><integer>1572864</integer></array><key>type</key><string>standard</string></dict></dict>"
```

## 設定をデフォルトに戻す

```shell
$ defaults delete com.apple.dock mru-spaces
```

## 設定を反映する

defaults write だけでは反映されないので、以下のコマンドを実行する

```shell
killall Dock
killall Finder
killall SystemUIServer
```

## 設定値の見つけ方

公式のドキュメントが見つからないため、自分で探すしかない…。
方法は、GUIで一つ変更するたびに `defaults read` で取得し、差分をチェックすることでどの設定値が対応しているかを見つける。

