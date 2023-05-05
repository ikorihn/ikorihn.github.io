---
title: ktlint
date: 2020-12-27T21:56:00+09:00
tags:
- Kotlin
- linter
lastmod: 2021-05-30T18:44:41+09:00
---

# ktlint

[Kotlin](note/Kotlin.md) でlintを設定する

<https://github.com/pinterest/ktlint>

.editorconfig を置くとそちらの設定が優先される

デフォルト設定に従うことにした

## Gradle(kts)

[プラグインなしで設定する場合](https://github.com/pinterest/ktlint#without-a-plugin)

面倒だったのでプラグインを使った

<https://github.com/jlleitschuh/ktlint-gradle>

build.gradle.kts

````kts
plugins {
  id "org.jlleitschuh.gradle.ktlint" version "<current_version>"
}
````

````sh
$ ./gradlew ktlintCheck
=> linterを実行

$ ./gradlew ktlintFormat
=> フォーマットをかけて保存
````

### Intellij IDEAの場合

IDEAにKotlinのcode style等を設定するタスクを追加してくれる。素敵

````kts
plugins {
  id("org.jlleitschuh.gradle.ktlint-idea") version "<current_version>"
}
````

````sh
./gradlew ktlintApplyToIdea
````
