---
title: spring-boot-configuration
date: "2021-03-08T18:49:00+09:00"
lastmod: '2021-05-30T18:57:07+09:00'
tags:
  - 'spring'

---

# spring-boot-configuration

Spring Boot で application.yml を Kotlin でバインディングできるようにしたい

## 環境

-   Spring Boot 2.4.0
-   Kotlin 1.4.10

## きっかけ

Spring Bootでは環境別に設定を切り替える仕組みとしてapplication.propertiesやapplication.ymlファイルを使えます。
application.ymlにカスタムプロパティを書きたい。

読み込む方法は主に2つ

-   `@Value`
-   `@ConfigurationProperties`

### `@Value` の場合

ApiConfiguration.kt

    @Configuration
    class ApiConfiguration(
        @Value("\${api.url}") url: String,
    ){

        @Bean
        fun apiClient(): RestOperations = RestTemplateBuilder()
                .rootUri(url)
                .build()

    }

application.yml

    api:
        url: "http://api.example.com"

これで設定できるが、application.ymlで以下の警告がでる。

`Cannot resolve configuration property 'api.url'`

それに、propertyがどこで使われているかや、型や説明がコードで明確になっていたほうが嬉しい
おすすめなのは以下

### `@ConfigurationProperties` の場合

<https://spring.pleiades.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config-constructor-binding>
<https://spring.pleiades.io/guides/tutorials/spring-boot-kotlin/>

ApiConfiguration.kt

```kotlin
@ConstructorBinding
@ConfigurationProperties("api")
data class ApiConfiguration(
    val url: String,
    val connection: Connection,
) {

    // ネストした情報はdata class内にさらにdata classを書く
    // api.connection.timeout となる
    data class Connection(
        val timeout: Int,
    )
}
```

これだけだとバインドされないので、機能を有効化する必要がある

```kotlin
@SpringBootApplication
@ConfigurationPropertiesScan
class MyApplication

fun main(args: Array<String>) {
    runApplication<MyApplication>(*args)
}
```

もしくは `@Configuration` クラスに個別に指定する

```kotlin
@Configuration
@EnableConfigurationProperties(ApiConfiguration::class)
class MyConfiguration {
}
```

### 補完が効くようにする

カスタムプロパティをIDEに認識させるためには、 `META-INF/spring-configuration-metadata.json` が存在する必要がある。

<https://spring.pleiades.io/spring-boot/docs/current/reference/html/appendix-configuration-metadata.html#configuration-metadata-annotation-processor>

build.gradle.kts

    dependencies {
        annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    }

Intellijでは、 `Preferences | Build, Execution, Deployment | Compiler | Annotation Processors` で `Enable annotation processing` を有効にするとビルド時に生成されるようになるとあるが、自分の環境では生成されなかった。

ドキュメントをよく見たら、Kotlinの場合 `kapt` が必要とのこと
<https://spring.pleiades.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-kotlin-configuration-properties>

build.gradle.kts

    plugins {
      ...
      kotlin("kapt") version "1.4.10"
    }

    dependencies {
      ...
      kapt("org.springframework.boot:spring-boot-configuration-processor")
    }

kaptタスクを実行

```sh
./gradlew kaptKotlin
```

自分の環境では `build/tmp/kapt3/classes/main/META-INF/spring-configuration-metadata.json` に作成された
