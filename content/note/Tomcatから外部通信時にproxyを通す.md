---
title: Tomcatから外部通信時にproxyを通す
date: "2021-05-31T15:37:00+09:00"
lastmod: '2021-05-31T15:39:17+09:00'
tags:
  - 'Java'

---

```shell
-Dhttp.proxyHost="proxy.example.jp" \
-Dhttp.proxyPort=3333 \
-Dhttp.nonProxyHosts="localhost|127.0.0.1"
```

Intellij IDEAでは
Edit Configuration > Tomcat Server > Server > VM options

### 通信ライブラリを使っている場合、この設定だけでは反映されない

| 通信クラス                                      | 挙動                   |
| ----------------------------------------------- | ---------------------- |
| java.net.URLConnection                          | プロキシが使用される   |
| org.apache.http.impl.client.CloseableHttpClient | プロキシが使用されない |

`HttpClients.createSystem()` とする必要がある

