---
title: mvndを使ってmavenビルドを高速化
date: 2022-01-05T17:32:00+09:00
tags: null
---

\#Java 

https://github.com/apache/maven-mvnd

 > 
 > This project aims at providing faster Maven builds using techniques known from Gradle and Takari

Gradleのようにdeamonを立てることでビルドを高速化するプロジェクト。

### Java 8 では動かない

https://github.com/apache/maven-mvnd/issues/547

jdk >= 11 である必要がある。

### M1 Macでは動かない
