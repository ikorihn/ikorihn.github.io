---
title: Raycastでマイクのミュートを切り替える
date: "2022-03-11T12:19:00+09:00"
tags:
  - 'Mac'
  - 'Raycast'
lastmod: "2022-03-11T12:24:00+09:00"
---

[[Raycast]] を使ってマイクのミュートを切り替えます

Raycastの設定 > Extensions > +ボタン > Create Script Command > templateをApple Scriptにして任意の場所に作成

![[blog/Pasted-image-20220311122221.png|Pasted-image-20220311122221]]

```applescript:mute.applescript
#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title mic mute
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤖

set micVolume to muteMic()
display notification micVolume with title "Mic"
return micVolume

on muteMic()
	set inputVolume to 0
	set micVal to "🔇 muted"
	set volume input volume inputVolume
	return micVal
end muteMic
```

同様にして、 `unmute.applescript` を作成

```applescript:mute.applescript
#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title mic unmute
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤖

set micVolume to unmuteMic()
display notification micVolume with title "Mic"
return micVolume

on unmuteMic()
	set inputVolume to 80
	set micVal to "🔈 unmuted"
	set volume input volume inputVolume
	return micVal
end unmuteMic
```

Raycastの設定 > Extensions から、コマンドにショートカットを設定することができます。
私はアンミュートを `Cmd + Opt + m` , ミュートを `Cmd + Shift + Opt + m` に設定しています。

トグルのほうがいい場合は [[マイクのミュート・アンミュートを切り替える]] のスクリプトを作成する。
自分は現在の状態がミュートアンミュートのどちらであっても同じ動作をさせたいためそれぞれのコマンドを登録しています。

