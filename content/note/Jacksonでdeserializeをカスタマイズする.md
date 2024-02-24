---
title: Jacksonでdeserializeをカスタマイズする
date: "2022-03-07T19:30:00+09:00"
tags:
  - 'Kotlin'
  - 'Java'
lastmod: "2022-03-07T19:30:00+09:00"
---

#Kotlin #Java



## JSONの特定の値に応じてパースする型を変えたい

JSONのtypeというパラメータによって、使うフィールドが異なる場合にパッと思いつくやり方は以下かなと思います。

```kotlin
data class User(
    // ユーザーのタイプを表す 'free' or 'payed'
    val type: String,
    // どちらの型でも共通
    val name: String,
    // freeの場合のみ存在する
    val trialEndAt: Date,
    // payedの場合のみ存在する
    val purchasedAt: Date,
)
```

```json
{
  "users": [
    {
      "type": "free",
      "name": "John",
      "trialEndAt": '2022-02-02T19:00:00+09:00'
    },
    {
      "type": "payed",
      "name": "Alice",
      "purchasedAt": '2022-01-22T19:00:00+09:00'
    }
  ]
}
```


### `@JsonTypeInfo`、`@JsonSubTypes` を使って型を振り分ける

```kotlin
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type") // “type” というJSONのキーで型を判別する
@JsonSubTypes(  // “type”の値に応じてどの型にパースするか
    value = [
        JsonSubTypes.Type(value = User.Free::class, name = "free"),
        JsonSubTypes.Type(value = User.Payed::class, name = "payed"),
    ]
)
sealed class User(val name: String) { // type はフィールドには入れない
    data class Free(val trialEndAt: Date) : User()

    data class Payed(val purchasedAt: Date) : User()
}
```

普段は継承をあまり使いたくないが、 `sealed class` でスコープを限定することで使いやすくした。
継承にする必要はなく別クラスに定義しても問題ないはず。

## 参考

[Kotlin with Jackson: Deserializing Kotlin Sealed Classes | by Sergii Prodan | Medium](https://serpro69.medium.com/kotlin-with-jackson-deserializing-kotlin-sealed-classes-c95f837e9164)
[JsonDeserializerを使って空の時に型が配列になるプロパティに対応する - Qiita](https://qiita.com/yotama/items/1a95329a8cd87f6f0460)
[Jacksonで独自のJSONシリアライズをする | GROUP DEV BLOG | TECHNO DIGITAL](https://www.tcdigital.jp/dev_blog/programming/jackson%E3%81%A7%E7%8B%AC%E8%87%AA%E3%81%AEjson%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%82%92%E3%81%99%E3%82%8B/)
[Jackson使い方メモ - Qiita](https://qiita.com/opengl-8080/items/b613b9b3bc5d796c840c#%E5%9E%8B%E5%BC%95%E6%95%B0%E3%82%92%E6%8C%81%E3%81%A4%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%92%E3%83%87%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%99%E3%82%8B)
[Parse Snake case JSON in Spring Boot | by Bhanu Chaddha | Medium](https://medium.com/@bhanuchaddha/parse-snake-case-json-in-spring-boot-66b42627a791)
[備忘録的なblog: Jacksonでsnake caseのキーをlower camel caseのプロパティーにデシリアライズする](http://se-bikou.blogspot.com/2019/01/jacksonsnake-caselower-camel-case.html)
[Jackson overcoming underscores in favor of camel-case](https://stackoverflow.com/questions/10519265/jackson-overcoming-underscores-in-favor-of-camel-case)
