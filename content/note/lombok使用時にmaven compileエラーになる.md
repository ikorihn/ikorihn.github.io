---
title: lombok使用時にmaven compileエラーになる
date: "2021-05-11T22:15:00+09:00"
lastmod: '2021-05-11T22:15:56+09:00'

---

lombok使用時にmaven compileエラーになる

```sh
$ mvn compile

...

Caused by: java.lang.ClassNotFoundException: com.sun.tools.javac.code.TypeTags
    at java.lang.ClassLoader.findClass (ClassLoader.java:719)
    at java.lang.ClassLoader.loadClass (ClassLoader.java:589)
    at lombok.launch.ShadowClassLoader.loadClass (ShadowClassLoader.java:422)
    at java.lang.ClassLoader.loadClass (ClassLoader.java:522)
    at java.lang.Class.forName0 (Native Method)
    at java.lang.Class.forName (Class.java:377)
    at lombok.javac.JavacTreeMaker$SchroedingerType.getFieldCached (JavacTreeMaker.java:156)
    at lombok.javac.JavacTreeMaker$TypeTag.typeTag (JavacTreeMaker.java:245)
    at lombok.javac.Javac.<clinit> (Javac.java:155)

```

- lombok: 1.16.20
- jdk: 1.8

brewでopenjdkがインストールされていてバージョンが変わっていた
なにかに依存して入っていた模様

    $ mvn --version
    Apache Maven 3.8.1 (05c21c65bdfed0f71a2f2ada8b84da59348c4c5d)
    Maven home: /usr/local/Cellar/maven/3.8.1/libexec
    Java version: 15.0.2, vendor: N/A, runtime: /usr/local/Cellar/openjdk/15.0.2/libexec/openjdk.jdk/Contents/Home

[java.lang.ClassNotFoundException: com.sun.tools.javac.code.TypeTags · Issue #1651 · projectlombok/lombok](https://github.com/projectlombok/lombok/issues/1651)

lombok 1.16.22 で解消している模様
