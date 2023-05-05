---
title: Kotlin_Coroutinesの並列数を制御する
date: 2021-06-02T17:16:00+09:00
lastmod: 2021-06-02T17:16:25+09:00
tags:
- Kotlin
---

\#Kotlin

## やりたいこと

[Kotlin_Coroutines](Kotlin_Coroutines.md) を使って並列処理をしたときに、並列数を制御したい
デフォルトだと、CPUのコア数？

## 方法

### Semaphore

https://stackoverflow.com/questions/58428584/limiting-the-maximum-number-of-coroutines-that-can-run-in-a-scope

````kotlin
    import kotlinx.coroutines.sync.Semaphore

    val requestSemaphore = Semaphore(5)
    
    runBlocking {
        mDownloadJobs.map {
            async {
                // Will limit number of concurrent requests to 5
                requestSemaphore.withPermit {
                    it.loadData()
                }
            }
        }
    }
````

kotlin,kotlinx 1.3 の環境では `kotlin/KotlinNothingValueException` がでて、 SemaphoreImpl が見つからないというエラーが出てしまいだめだった

kotlin-stdlib-jdk8 と kotlinx-coroutines-core だけだとだめ
kotlin-stdlibを追加して、1.4にすると動いた

### Channelを使う

https://stackoverflow.com/questions/47686353/how-to-cap-kotlin-coroutines-maximum-concurrency
https://tech.uzabase.com/entry/2019/11/05/190000
