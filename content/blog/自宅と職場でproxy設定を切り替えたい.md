---
title: 自宅と職場でproxy設定を切り替えたい
date: "2021-10-08T10:47:00+09:00"
tags:
  - 'Mac'
  - 'Network'
  - 'shell'
lastmod: '2021-10-08T12:54:16+09:00'
---

出社時と在宅時で、プロキシの接続情報を変更する必要がある。
手で切り替えるのを忘れて社内システムにつながらない…ということがよく発生するので、自動化することにした。

## 切り替えたい対象

- プロキシ設定
- git proxyの設定を環境に応じて変更

## 実現方法

- proxy.pac をローカルのhttpサーバーで配布
- Macのネットワーク設定 > Location で自宅と職場でproxy.pacのURLをそれぞれ設定
- git proxyをset,unsetするコマンドを実行
- wifiのSSIDが家か職場を判定して分岐する
- トリガーはスリープからの復帰時

### プロキシ設定について

プロキシの設定はproxy.pacを使って行う。
職場では社内で配布されるproxy.pacのURLを入力すればいいが、
自宅では、自前のproxy.pacを作って設定したい。

しかし、Mojaveからローカルのproxy.pacを `file://` で設定することができなくなった

[macOS 10.14 Mojave 以降で pac ファイルを使って proxy の設定を行いたいけど出来なかった話 - Qiita](https://qiita.com/orange634nty/items/9ef5cadd039592e8344a)

> #### Deprecations
>
> The `ftp://` and `file://` URL schemes for Proxy Automatic Configuration (PAC) are deprecated. HTTP and HTTPS are the only supported URL schemes for PAC. This affects all PAC configurations including, but not limited to, configurations set via Settings, System Preferences, profiles, and [`URLSession`](https://developer.apple.com/documentation/foundation/urlsession) APIs such as [`connectionProxyDictionary`](https://developer.apple.com/documentation/foundation/urlsessionconfiguration/1411499-connectionproxydictionary), and [`CFNetworkExecuteProxyAutoConfigurationURL(_:_:_:_:)`](https://developer.apple.com/documentation/cfnetwork/1426392-cfnetworkexecuteproxyautoconfigu). (37811761)

そのため、ローカルにhttpサーバーを立てて `http://localhost` を設定する方法をとる

## proxy.pacをローカルのhttpサーバーで配布

### httpdをインストール、自動起動

```shell
$ brew install httpd

# M1 Macの場合 /opt/homebrew/etc に設定ファイルがある
$ vim /opt/homebrew/etc/httpd/httpd.conf
=> Listenポートを任意に設定する(私は80に設定)

$ brew services start httpd
==> Successfully started `httpd` (label: homebrew.mxcl.httpd)

# `brew services start` するとlaunchdに登録され、自動起動するようになる (`brew services stop` すると停止、自動起動も解除される)
$ launchctl list | rg brew
63000   0       homebrew.mxcl.httpd
$ cat ~/Library/LaunchAgents/homebrew.mxcl.httpd.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>EnvironmentVariables</key>
        <dict>
                <key>PATH</key>
                <string>/opt/homebrew/bin:/opt/homebrew/sbin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        </dict>
        <key>Label</key>
        <string>homebrew.mxcl.httpd</string>
        <key>ProgramArguments</key>
        <array>
                <string>/opt/homebrew/opt/httpd/bin/httpd</string>
                <string>-D</string>
                <string>FOREGROUND</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
</dict>
</plist>
```

### proxy.pacを配置

`/opt/homebrew/var/www/` にproxy.pacを置く

<http://localhost/proxy.pac> で取得できるようになる

## Macのネットワーク設定 > Location で自宅と職場でproxy.pacのURLをそれぞれ設定

![[blog/Pasted-image-20211008123230.png|Pasted-image-20211008123230]]

それぞれのLocationで、proxy.pacのURLを入力する

自宅: `http://localhost/proxy.pac`
職場: `社内のproxy.pacのURL`
![[blog/Pasted-image-20211008124722.png|Pasted-image-20211008124722]]

## ネットワーク切り替え時に実行するスクリプトを作成

[[ネットワークに応じて処理を振り分けるスクリプト]]

## sleep復帰時にスクリプトを実行する

### sleepwatcherをインストール

[[Macスリープ時・復帰時に処理を動かす]]

スリープ前や復帰時にスクリプトを実行できるようになる

```shell
brew install sleepwatcher
```

### plistファイルを作成する

`~/Library/LaunchAgents` 以下にファイルを作成

```xml:~/Library/LaunchAgents/sleepwatcher.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>sleepwatcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/sbin/sleepwatcher</string>
        <string>-V</string>
        <string>-w /path/to/switch_location.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

- `-w` スリープ復帰（Wake Up）時に実行するコマンド
- `-s` スリープ（Sleep）時に実行するコマンド

### launchdに登録

```shell
$ launchctl load ~/Library/LaunchAgents/sleepwatcher.plist
```

## 参考

[Mac のスリープ／復帰時にスクリプトを実行する - Qiita](https://qiita.com/fiftystorm36/items/5fe936a92445cbf4ad9a)
[Macの起動/スリープ復帰時に自動でVPNに接続する / LOG](https://log.brdr.jp/post/887)
[Mac でネットワーク環境を使う方法 - Apple サポート (日本)](https://support.apple.com/ja-jp/HT202480)
[macOS 10.14 Mojave 以降で pac ファイルを使って proxy の設定を行いたいけど出来なかった話 - Qiita](https://qiita.com/orange634nty/items/9ef5cadd039592e8344a)
