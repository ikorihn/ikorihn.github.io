---
title: mavenで実行可能jarファイル(Fat Jar)を作成する
date: 2024-05-23T11:50:00+09:00
---

関連 [[build.gradle.ktsでfatJarを作る]] 

[[maven]] でFat Jar(依存関係も含めたJarファイル)を作るには、 [Apache Maven Assembly Plugin](https://maven.apache.org/plugins/maven-assembly-plugin/) を使うと良い。
ちなみにFat Jarは uber-jar ともいう

```xml:title=pom.xml
<project>
  <build>
    <plugins>
      <plugin>
        <artifactId>maven-assembly-plugin</artifactId>
        <version>3.7.1</version>
        <configuration>
          <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
          </descriptorRefs>
          <archive>
            <manifest>
              <mainClass>com.example.Main</mainClass> <!-- エントリーポイント -->
            </manifest>
          </archive>
        </configuration>
        <executions>
          <execution>
            <id>make-assembly</id>
            <phase>package</phase>  <!-- mvn package時にassemblyも実行されるようにする -->
            <goals>
              <goal>single</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
....
    </plugins>
....

</project>
```

これを追記した状態で `mvn package` をすると、targetに `${app}-jar-with-dependencies.jar` が作成されているので、 `java -jar target/${app}-jar-with-dependencies.jar` で実行することができる。

