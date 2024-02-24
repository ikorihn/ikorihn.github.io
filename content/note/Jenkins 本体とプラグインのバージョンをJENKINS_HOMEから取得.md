---
title: Jenkins 本体とプラグインのバージョンをJENKINS_HOMEから取得
date: 2024-02-07T15:52:00+09:00
tags:
  - Jenkins
lastmod: '2024-02-07T15:52:59+09:00'
---

[[Jenkins]] のscript consoleでGroovyスクリプトを使えばバージョン一覧を出すことができるが、めんどうなのでサーバーにsshして直接取れないかファイルを見てみた。

`$JENKINS_HOME/plugins` 配下にプラグインの一覧があり、`.version_from_image` で終わるファイルにバージョンが書かれていそうだった。
本体のバージョンは `$JENKINS_HOME/config.xml` から取れた。

```shell
find /var/jenkins_home/plugins -maxdepth 1 -name '*.version_from_image' | xargs -i grep -H -F '' {}
grep -- '<version>' /var/jenkins_home/config.xml
```
