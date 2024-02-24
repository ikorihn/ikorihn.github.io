---
title: Javaで同一のFQCNがclasspath上に複数ある場合の挙動
date: "2021-07-13T17:03:00+09:00"
tags: 
---

#Java

2つのライブラリに同じclassが存在するときの挙動について

## 例

[org:json:1.0](https://mvnrepository.com/artifact/org/json/1.0.0)
[com.googlecode.json-simple:1.1.1](https://mvnrepository.com/artifact/com.googlecode.json-simple/json-simple/1.1.1)

`org.json.simple.parser.JSONParser` が両方のライブラリに存在する

- `org.json.simple.parser.JSONParser.parse(Ljava/io/String;)Ljava/lang/Object;` はjson-simpleにしかないので、org:jsonが先に読み込まれているときにこれを使おうとするとNoSuchMethodExceptionが出る
- `org.json.simple.parser.JSONParser.parse(Ljava/io/Reader;)Ljava/lang/Object;` は org:json と json-simple 両方に存在するので、このメソッドを使う場合はどちらのライブラリが読み込まれても関係ない
- classpathの読み込み順によって問題が発生したりしなかったりする
