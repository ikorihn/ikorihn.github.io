---
title: spotlessでコードフォーマットする
date: "2021-06-17T14:49:00+09:00"
lastmod: '2021-06-18T22:50:20+09:00'
tags:
  - 'Java'
  - 'Kotlin'
---

<https://github.com/diffplug/spotless/tree/main/plugin-maven>

Java,Kotlinのプロジェクトにフォーマッタとしてspotlessを導入する

## Java

link: [[JavaのFormatter]]

以下のフォーマッタが利用可能

<https://github.com/google/google-java-format>
<https://github.com/jhipster/prettier-java>
<https://github.com/diffplug/spotless/blob/main/ECLIPSE_SCREENSHOTS.md>

[JavaユーザならCode FormatterにはSpotlessがオススメ - 京都行きたい](https://progret.hatenadiary.com/entry/2019/12/09/165048)

<https://github.com/diffplug/spotless/tree/main/plugin-maven#java>

```xml
            <plugin>
                <groupId>com.diffplug.spotless</groupId>
                <artifactId>spotless-maven-plugin</artifactId>
                <version>2.9.0</version>
                <configuration>
                    <formats>
                        <!-- you can define as many formats as you want, each is independent -->
                        <format>
                            <!-- define the files to apply to -->
                            <includes>
                                <include>*.md</include>
                                <include>.gitignore</include>
                            </includes>
                            <!-- define the steps to apply to those files -->
                            <trimTrailingWhitespace/>
                            <endWithNewline/>
                            <indent>
                                <tabs>true</tabs>
                                <spacesPerTab>4</spacesPerTab>
                            </indent>
                        </format>
                    </formats>
                    <!-- define a language-specific format -->
                    <java>
                        <includes>
                            <include>src/main/java/**/*.java</include>
                        </includes>
                        <importOrder /> <!-- standard import order -->
                        <!-- no need to specify files, inferred automatically, but you can if you want -->
                        <removeUnusedImports />
                        <!-- apply a specific flavor of google-java-format -->
                        <googleJavaFormat>
                            <version>1.7</version>
                            <style>AOSP</style>
                        </googleJavaFormat>
                    </java>
                </configuration>
            </plugin>
        </plugins>
```

### Google Java Formatのインデントサイズ変更

Google Java Formatはインデントサイズが2
すっきりして見た目はいいんだけど、既存への影響が大きい

<https://github.com/diffplug/spotless/issues/420>
AOSPスタイルだとインデントサイズは4

eclipse を使うことで、フォーマットが柔軟に変更できる

## Kotlin

<https://github.com/pinterest/ktlint>
<https://github.com/Angry-Potato/prettier-plugin-kotlin>
