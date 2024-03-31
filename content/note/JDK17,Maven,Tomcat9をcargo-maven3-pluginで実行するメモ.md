---
title: JDK17,Maven,Tomcat9をcargo-maven3-pluginで実行するメモ
date: 2024-03-18T11:59:00+09:00
tags:
  - Java
---

[[Tomcat]] で動いている [[Java]] アプリケーションを少し調査のために触る機会があって、[[Eclipse]] のセットアップが面倒だったので簡単にローカルで実行できないかなと調べた。

## 環境

```shell
❯ mvn --version
Apache Maven 3.9.6 (bc0240f3c744dd6b6ec2920b3cd08dcc295161ae)
Maven home: /opt/homebrew/Cellar/maven/3.9.6/libexec
Java version: 17.0.8, vendor: Amazon.com Inc., runtime: /Library/Java/JavaVirtualMachines/amazon-corretto-17.jdk/Contents/Home
```

## Mavenプラグイン

[tomcat7-maven-plugin](https://tomcat.apache.org/maven-plugin-2.0/tomcat7-maven-plugin/) というのが Tomcat 9でも使えるらしいが、[cargo-maven3-plugin](https://codehaus-cargo.github.io/cargo/Maven+3+Plugin.html) の方が最近は使われていそうなのでこちらにしてみた。
以下で実行できる。

```
mvn org.codehaus.cargo:cargo-maven3-plugin:run
```

ただ問題があって一発では起動しなかった。

## `module java.base does not "opens java.lang" to unnamed module` というエラー

`java.lang.reflect.InaccessibleObjectException: Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module`
というエラーでJettyが起動しなかった。

JDK17では [JEP 403: Strongly Encapsulate JDK Internals](https://openjdk.org/jeps/403) という仕様が追加されていて、ローレベルなAPIを叩いていると例外が発生するらしい。
これを回避するには、Javaのオプションで `--add-opens=java.base/java.lang=ALL-UNNAMED`  といった指定をするとよい。

どこでこのCLIオプションを設定するのかわかりにくかったが、`configuration.properties."cargo.jvmargs"` で良さそうだ
https://codehaus-cargo.atlassian.net/wiki/spaces/CARGO/pages/491563/Configuration+properties

```
    <build>
        <plugins>
            <plugin>
              <groupId>org.codehaus.cargo</groupId>
              <artifactId>cargo-maven3-plugin</artifactId>
              <version>1.10.12</version>
              <configuration>
                <configuration>
                  <properties>
                    <cargo.jvmargs>-Xmx2048m --add-opens=java.base/java.lang=ALL-UNNAMED</cargo.jvmargs>
                  </properties>
                </configuration>
              </configuration>
            </plugin>
        </plugins>
    </build>
```


## 参考

- [Java 8 から Java 17 への移行メモ - いしぐめも](https://yoh1496.hatenablog.com/entry/2022/08/16/152408)
- [tomcat - Migrate tomcat7-maven-plugin to cargo-maven3-plugin - Stack Overflow](https://stackoverflow.com/questions/76285287/migrate-tomcat7-maven-plugin-to-cargo-maven3-plugin)
- [tomcat - Migrate tomcat7-maven-plugin to cargo-maven3-plugin - Stack Overflow](https://stackoverflow.com/questions/76285287/migrate-tomcat7-maven-plugin-to-cargo-maven3-plugin)