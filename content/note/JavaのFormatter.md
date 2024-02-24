---
title: JavaのFormatter
date: "2021-05-07T21:57:00+09:00"
tags:
  - 'Java'
lastmod: '2021-06-18T22:50:28+09:00'
---

[Java Check-style and Formatting using Maven | by Arushi Sharma | Medium](https://medium.com/@aru_sha4/java-check-style-and-formatting-using-maven-a1a1b4e6e10a)

## google-java-format

<https://github.com/google/google-java-format/>

mavenのpluginではなくIDEのpluginだったり、spotlessから使ったりするライブラリ

## googleformatter-maven-plugin

<https://github.com/talios/googleformatter-maven-plugin>

Google Java Formatを適用するプラグイン

## formatter-maven-plugin

[maven-formatterを使ってformatを自動化 - Qiita](https://qiita.com/daikon510/items/abb8cdc552833b5cdaf7)
[mavenプロジェクトでフォーマッターを使う - よーぐるとのブログ](https://yoghurt1131.hatenablog.com/entry/2017/10/01/204302)
<https://code.revelc.net/formatter-maven-plugin/>

独自のformat設定を行うにはEclipse形式の設定ファイルを指定する。

[googleが公開しているformat](https://github.com/google/styleguide/blob/gh-pages/eclipse-java-google-style.xml)

これを書き換えればいいんだろうけど、あまり独自設定はいれたくない気もする

```xml
<project ...>
    ...
    <plugin>
      <groupId>net.revelc.code.formatter</groupId>
      <artifactId>formatter-maven-plugin</artifactId>
      <version>2.11.0</version>
      <configuration>
        <directories>
          <!-- 対象ディレクトリ -->
          <directory>${project.build.sourceDirectory}</directory>
          <directory>${project.build.directory}/generated-sources</directory>
        </directories>
        <includes>
          <include>jp/****/****/****/formatter/</include>
        </includes>
        <excludes>
          <exclude>jp/relativitas/maven/plugins/formatter/special/</exclude>
          <exclude>**/*Test.java</exclude>
        </excludes>
        <configFile>${project.basedir}/eclipse-java-google-style.xml</configFile>
      </configuration>
    </plugin>
    ...
</project>
```

## Spotless

[[spotlessでコードフォーマットする]]

## Checkstyle

これは多分フォーマットチェックするだけで、チェックは上のプラグインでできるので特別不要なきがする

## Kotlinの場合

[[KotlinのFormatter]]


## 参考

- https://aru-sha4.medium.com/java-check-style-and-formatting-using-maven-a1a1b4e6e10a
- https://google.github.io/styleguide/javaguide.html#s4.2-block-indentation
- https://stackoverflow.com/questions/65791764/klint-and-spotless-com-pinterest-ktlint-core-parseexception-expecting-a-parame
- https://code.visualstudio.com/docs/java/java-linting
- https://github.com/jhipster/prettier-java
- https://github.com/pinterest/ktlint/issues
- https://github.com/diffplug/spotless/tree/main/plugin-maven#eclipse-jdt
- https://github.com/diffplug/spotless/blob/main/ECLIPSE_SCREENSHOTS.md
- https://github.com/google/styleguide
- https://www.howtogeek.com/723144/how-to-copy-the-url-addresses-of-all-open-tabs-in-chrome/
