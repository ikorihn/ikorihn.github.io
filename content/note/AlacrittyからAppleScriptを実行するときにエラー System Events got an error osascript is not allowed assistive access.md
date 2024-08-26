---
title: AlacrittyからAppleScriptを実行するときにエラー System Events got an error osascript is not allowed assistive access
date: 2024-07-29T14:23:00+09:00
tags:
  - Applescript
---


[[Alacritty]] から [[AppleScript]] を実行する際、UIを操作するスクリプトを実行した際に下記のようなエラーが出て、実行に失敗した。

```osascript
#!/usr/bin/osascript
tell application "System Events"
  tell process "Control Center"
      tell (menu bar item 1 of menu bar 1 where description is "clock")
          click
      end tell
  end tell
end tell
```

```shell
$ osascript ~/tools/clear.applescript
System Events got an error: osascript is not allowed assistive access. (-1719)
```

System Settings > Privacy & Security > Accessibility
よりAlacrittyに許可を与えても変化がなかった。
一度 `-` ボタンで削除して再度追加しても効果はなかった。

## 解消方法

こちらに解決方法が書いてあった。
https://github.com/alacritty/alacritty/issues/7334O

次のコマンドで、Accessibilityをリセット -> 再起動で再度ダイアログを表示させることができて、そこで許可することで、エラーなく実行できるようになった。
おそらく以前に一度権限を拒否したせいで、設定から許可を与えても有効にならなかったのかもしれない。

**これをするとAccessibilityの設定がすべてクリアされるので、別のアプリケーションも再度許可する必要があることに注意**

```shell
sudo tccutil reset Accessibility
```

ちなみに、`/usr/bin/tccutil` はreset以外のコマンドが存在しない。
https://github.com/jacobsalmela/tccutil をインストールするとリストアップなど便利なコマンドが利用できる。