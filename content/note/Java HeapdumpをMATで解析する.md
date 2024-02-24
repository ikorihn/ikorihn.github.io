---
title: Java HeapdumpをMATで解析する
date: "2023-04-07T13:04:00+09:00"
tags: 
    - '2023/04/07'
---

#Java 

Eclipse Memory Analyzer(MAT)
https://www.eclipse.org/mat/downloads.php



Amazon CorrettoのJDK 19が入っているのだが、matを開くとエラーがでて起動しなかった
`shared library does not contain the JNI_CreateJavaVM symbol`

OpenJDK 19を入れてJAVA_HOMEをこちらに変更したところ起動できた
https://jdk.java.net

```shell
$ curl -LO https://download.java.net/java/GA/jdk19.0.2/fdb695a9d9064ad6b064dc6df578380c/7/GPL/openjdk-19.0.2_macos-aarch64_bin.tar.gz
$ cd /Library/Java/JavaVirtualMachines
$ sudo tar -zxvf /tmp/openjdk-19.0.2_macos-aarch64_bin.tar.gz
$ export JAVA_HOME=$(pwd)/jdk-19.0.2.jdk/Contents/Home

```
