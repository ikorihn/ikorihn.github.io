---
title: Raycastでディスプレイの解像度を変更する
date: 2023-03-03T19:30:00+09:00
tags:
- 2023/03/03
- Raycast
lastmod: 2023-03-03T19:31:00+09:00
---

WQHD(2560x1440)ディスプレイを使っていると、画面共有時に文字が小さくなってしまい読めないことが多々あるので、画面共有するときは都度解像度を下げていた。
変更し忘れたり、変更するのにもたついたりする時間があるため、ディスプレイの解像度の変更を簡単にできないかを調べた。

## ゴール

* Raycastで解像度を変更できるようにする

## Raycastから実行するAppleScriptを作成

[Raycastでマイクのミュートを切り替える](blog/Raycastでマイクのミュートを切り替える.md)

引数つきで実行もできる

## AppleScriptの中身を書く

AppleScriptにはあまり詳しくないのでもっといい書き方があるかもしれないですが悪しからず

[mac - Is it possible to change display resolution with a keyboard shortcut? - Ask Different](https://apple.stackexchange.com/questions/263162/is-it-possible-to-change-display-resolution-with-a-keyboard-shortcut)
によるとOSのバージョンによってUIが異なるのでスクリプトを変えないといけないみたい

### Monterey(12.6) の場合

````applescript
#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle display resolution
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤖
# @raycast.argument1 { "type": "text", "placeholder": "Placeholder" }
# @raycast.packageName Mac Utils

on run argv

set resolution_index to ( item 1 of argv )

tell application "System Preferences"
  activate
  set the current pane to pane id "com.apple.preference.displays"
  delay 1
  tell application "System Events"
      tell window "Displays" of application process "System Preferences"
          click button "Display Settings…"
          delay 1

          tell sheet 1
              select row 2 of outline 1 of scroll area 1
              click radio button "Scaled" of radio group 1

              tell scroll area 2
                  tell table 1
                      select row (resolution_index as integer)
                  end tell
              end tell
          end tell

          delay 1
          click button "Done" of sheet 1
      end tell
  end tell
end tell

# The next line is optional and could be commented out by prepending with a hash (#).
# delay 2
# quit application "System Preferences"
end run
````

### 解説

`on run argv` 
引数つきで実行する

`set resolution_index to ( item 1 of argv )`
1つめの引数を代入する

````
tell application "System Preferences"
...
        tell window "Displays" of application process "System Preferences"
          click button "Display Settings…"
````

System Preferencesを開いて、ボタンクリックなどの画面操作をする

````
          tell sheet 1
              select row 2 of outline 1 of scroll area 1
              click radio button "Scaled" of radio group 1

              tell scroll area 2
                  tell table 1
                      select row (resolution_index as integer)
                  end tell
              end tell
          end tell
````

Display Settingsの画面で、

1. 2番目のモニターを選択
1. ラジオボタンScaledをクリックして解像度のリストを開く
1. 解像度のリストから引数で指定したインデックスを選択する

以降は画面を閉じたりアプリケーションを終了したりを行うパート

## 所感

* 操作対象のUIを特定するために `log every UI element` で一覧出力するのが便利だった
* UIを番号で指定しているのが、簡単に壊れそうで嫌だな
* 解像度の指定もインデックスでやっているがわかりにくいな

## 参考

[AppleScript to change Display Resolution - Apple Community](https://discussions.apple.com/thread/253787938)
[mac - Is it possible to change display resolution with a keyboard shortcut? - Ask Different](https://apple.stackexchange.com/questions/263162/is-it-possible-to-change-display-resolution-with-a-keyboard-shortcut)
[macbook pro - a single keyboard shortcut that toggles between 2 resolutions on MacOS 12.6 - Ask Different](https://apple.stackexchange.com/questions/449891/a-single-keyboard-shortcut-that-toggles-between-2-resolutions-on-macos-12-6)
[Change screen resolution AppleScript](https://gist.github.com/mvaneijgen/73458ffb956e825c5786#file-scale-resolution-scpt-L21)
