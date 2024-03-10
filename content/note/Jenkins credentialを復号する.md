---
title: Jenkins credentialを復号する
date: 2024-03-08T18:01:00+09:00
tags:
  - Jenkins
---

是非はおいておいて、 [[Jenkins]] に登録したCredentialは復号ができてしまう。

[Accessing and dumping Jenkins credentials | Codurance](https://www.codurance.com/publications/2019/05/30/accessing-and-dumping-jenkins-credentials)

credentialを開いて、developer toolsで `{AQAAAxxxxxxxxx....}` みたいな文字列を取得
-> Script consoleで以下を実行すると平文が取得できる

```groovy
println hudson.util.Secret.decrypt("{AQAAAで始まる値}")
```
