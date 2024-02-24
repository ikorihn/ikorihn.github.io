---
title: build.gradle.ktsでfatJarを作る
date: "2021-11-12T13:43:00+09:00"
tags: 
---

https://stackoverflow.com/questions/41794914/how-to-create-the-fat-jar-with-gradle-kotlin-script

```kts
val projectName = "my-projet"

application {
    // mainを設定(コンパイル後Ktがつくことに注意)
    mainClass.set("com.MainKt")
}

// `fatJar` の名前でタスクを定義する
task("fatJar", Jar::class) {
    archiveBaseName.set(projectName)
    manifest {
        attributes["Main-Class"] = mainClass
    }
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    from(
        // classpathからjarファイルを取得して、zipに加える
        configurations.runtimeClasspath.get().map {
            if (it.isDirectory) it else zipTree(it)
        }
    )
    exclude("META-INF/*.RSA", "META-INF/*.SF", "META-INF/*.DSA")

}

```





gradle installDist したときのディレクトリ名と実行ファイル名の設定

```shell
my-project$ ./gradlew installDist

# すると以下のツリーができる
# my-project/build/install/my-project/lib
# my-project/build/install/my-project/lib/...
# my-project/build/install/my-project/bin
# my-project/build/install/my-project/bin/my-project (executable)
```
