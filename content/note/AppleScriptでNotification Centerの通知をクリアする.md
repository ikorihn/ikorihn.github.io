---
title: AppleScriptでNotification Centerの通知をクリアする
date: 2023-09-28T23:25:00+09:00
tags:
- Productivity
- Applescript
---

溜まった通知を全部きれいにする方法を調べた。

````applescript
#!/usr/bin/osascript

on run
  tell application "System Events"
      tell process "Control Center"
          tell (menu bar item 1 of menu bar 1 where description is "clock")
              click
          end tell
      end tell

      repeat
        set noGroups to true
        set _groups to groups of UI element 1 of scroll area 1 of group 1 of window "Notification Center" of application process "NotificationCenter"
        log "start"
        set numGroups to number of _groups
        if numGroups = 0 then
          exit repeat
        end if
        repeat with _group in _groups
          set _actions to actions of _group
          set actionPerformed to false
          repeat with _action in _actions
            if description of _action is in {"Clear All"} then
              log _group
              log _action
              perform _action
              set actionPerformed to true
              exit repeat
            end if
          end repeat
          repeat with _action in _actions
            if description of _action is in {"Close"} then
              log _group
              log _action
              perform _action
              set actionPerformed to true
              exit repeat
            end if
          end repeat
          if actionPerformed then
            exit repeat
          end if
        end repeat
      end repeat
  end tell
end run
````

* 通知を開く部分
* Close Allする部分

## 参考

* [AppleScript to close all notifications on macOS Big Sur, Monterey, and Ventura](https://gist.github.com/lancethomps/a5ac103f334b171f70ce2ff983220b4f)
* [macos - How to get notification subtitle/body using AppleScript? - Stack Overflow](https://stackoverflow.com/questions/60971590/how-to-get-notification-subtitle-body-using-applescript)
* [Turn Do Not Disturb on or off in an Applescript app (macOS Catalina) - Ask Different](https://apple.stackexchange.com/questions/419207/turn-do-not-disturb-on-or-off-in-an-applescript-app-macos-catalina)
