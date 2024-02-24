---
title: Junitでメソッド名が長すぎてエラーになる
date: "2023-05-05T20:37:00+09:00"
tags:
  - unittest
  - Java
---
 
```txt
[ERROR] org.jetbrains.kotlin.backend.common.BackendException: Backend Internal error: Exception during file facade code generation File being compiled: [file:///tmp/workspace/very/long/long/TestClass.java]
The root cause java.io.FileNotFoundException was thrown at: java.io.FileOutputStream.open0(Native Method)
	at org.jetbrains.kotlin.backend.common.CodegenUtil.reportBackendException(CodegenUtil.kt:239)
	at org.jetbrains.kotlin.codegen.PackageCodegenImpl.generate(PackageCodegenImpl.java:78)
	at org.jetbrains.kotlin.codegen.DefaultCodegenFactory.generatePackage(CodegenFactory.kt:77)
	at org.jetbrains.kotlin.codegen.DefaultCodegenFactory.generateModule(CodegenFactory.kt:62)
	at org.jetbrains.kotlin.codegen.KotlinCodegenFacade.compileCorrectFiles(KotlinCodegenFacade.java:35)
    ...
Caused by: java.io.FileNotFoundException: /tmp/workspace/very/long/long/TestClass.java$test_とてもながあああああああああああああああああああああああああああああああああああああああいテストケース名$1.class (File name too long)
	at java.io.FileOutputStream.open0(Native Method)
	at java.io.FileOutputStream.open(FileOutputStream.java:270)
	at java.io.FileOutputStream.<init>(FileOutputStream.java:213)
	...
```

テストメソッドを説明的にしようと長くしすぎると、実行環境のファイルパス長の制限によってエラーになる
