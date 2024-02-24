---
title: JUnitでresourceのファイルを読み込む
date: "2021-06-08T17:50:00+09:00"
lastmod: '2021-06-08T17:51:19+09:00'
tags:
  - 'Java'
---

ユニットテスト時に、

<https://www.baeldung.com/junit-src-test-resources-directory-path>
<https://stackoverflow.com/questions/3891375/how-to-read-a-text-file-resource-into-java-unit-test>

Hoge.class.getResourceを使うとよい

```java
public class FooTest {
  @Test public void readXMLToString() throws Exception {
        java.net.URL url = MyClass.class.getResource("test/resources/abc.xml");
        java.nio.file.Path resPath = java.nio.file.Paths.get(url.toURI());
        String xml = new String(java.nio.file.Files.readAllBytes(resPath), "UTF8"); 
  }
```

Java 9+ではこう

```java
new String(getClass().getClassLoader().getResourceAsStream(resourceName).readAllBytes());
```

ClassLoader.getSystemResource() でもロードできるが、ときどきNullPointerExceptionでおちる
