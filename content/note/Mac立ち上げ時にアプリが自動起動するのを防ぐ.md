---
title: Mac立ち上げ時にアプリが自動起動するのを防ぐ
date: 2021-10-07T14:24:00+09:00
tags: null
---

\#Mac 

EAA Clientが自動起動して、オフにする設定もないのでこまった。

launchctlに登録されているようなので、それを削除することにした。

````shell
$ launchctl list | grep eaa
-       78      net.eaacloop.uninstall
-       0       net.eaacloop.eaaclient
28947   0       application.com.akamai-access.go.eaacloop.1207957.1208116

$ cat /Library/LaunchAgents/net.eaacloop.eaaclient.plist
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.eaacloop.eaaclient</string>
    <key>ProgramArguments</key>
    <array>
      <string>/Applications/EAAClient.app/Contents/MacOS/EAAClient</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>version</key>
    <string>1.0.1</string>
    <key>StandardErrorPath</key>
    <string>/tmp/eaacTraystderr.log</string>
    <key>StandardOutPath</key>
    <string>/tmp/eaacTraystdout.log</string>
  </dict>
</plist>

# unloadする
$ launchctl unload /Library/LaunchAgents/net.eaacloop.eaaclient.plist

# ファイル自体は消えない
$ ls /Library/LaunchAgents/net.eaacloop.eaaclient.plist
/Library/LaunchAgents/net.eaacloop.eaaclient.plist*

$ launchctl list | grep eaa
-       78      net.eaacloop.uninstall
28947   0       application.com.akamai-access.go.eaacloop.1207957.1208116
````

=> これではPC再起動するともとに戻ってしまう。

plistファイルを `sudo vim /Library/LaunchAgents/net.eaacloop.eaaclient.plist` で開いて、 `RunAtLoad` をfalseにする。

````plist
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.eaacloop.eaaclient</string>
    <key>ProgramArguments</key>
    <array>
      <string>/Applications/EAAClient.app/Contents/MacOS/EAAClient</string>
    </array>
    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
    <key>version</key>
    <string>1.0.1</string>
    <key>StandardErrorPath</key>
    <string>/tmp/eaacTraystderr.log</string>
    <key>StandardOutPath</key>
    <string>/tmp/eaacTraystdout.log</string>
  </dict>
</plist>
````
