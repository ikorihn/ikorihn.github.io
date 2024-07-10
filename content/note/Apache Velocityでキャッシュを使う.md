---
title: Apache Velocityでキャッシュを使う
date: 2024-06-14T10:09:00+09:00
tags:
  - Java
---


[Apache Velocity](https://velocity.apache.org) は [[Java]] の軽量なテンプレートエンジン。
JSPと役割は同じだが、JSPは主にウェブアプリケーションのビュー層として使用される一方、Velocityはウェブページ生成だけでなく、メールテンプレートや他のテキストベースのテンプレート生成にも使用される。

またJSPはサーブレットコンテナで動作し、サーブレットにコンパイルされるが、VelocityのテンプレートはJavaコードとしてコンパイルされることはなく、ランタイムに解釈される。


## キャッシュを有効化する

パフォーマンス向上の為キャッシュ有効化の設定を入れる。

ドキュメントのバージョンは2.0だけど設定値は効いたっぽいのでOK
Velocityのバージョンは1.7

- [Apache Velocity performance pitfalls? - Stack Overflow](https://stackoverflow.com/questions/2334628/apache-velocity-performance-pitfalls)
- [Apache Velocity Engine - Configuration](https://velocity.apache.org/engine/2.0/configuration.html)

```properties
class.resource.loader.class = org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader
class.resource.loader.cache = true
class.resource.loader.modificationCheckInterval = -1
parser.pool.size = 40
velocimacro.library.autoreload = false
```

また `Velocity.init` の実行はアプリケーションの初期化時に一度だけ実行されるよう留意する