---
title: JUni4のparameterized testをJUnit5に
date: "2021-05-07T21:18:00+09:00"
tags:
  - 'Java'
  - 'Kotlin'
lastmod: '2021-05-07T21:19:13+09:00'

---

#Java
#Kotlin

## テスト対象コード

```kotlin
class Calculator() {
    fun add(x: Int, y: Int) = x + y
}
```

## JUnit4

```kotlin
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized

@RunWith(Parameterized::class)
internal class CalculatorTest(private val x: Int, private val y: Int, private val expected: Int) {

    @Test
    fun test() {
        val calc = Calculator()
        val actual = calc.add(x, y)
        MatcherAssert.assertThat(actual, CoreMatchers.equalTo(expected))
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters
        fun data() = listOf(
                arrayOf(1, 2, 3),
                arrayOf(9, 8, 17),
        )
    }
}
```

## JUnit5

```kotlin
import org.junit.Assert.assertEquals
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

internal class CalculatorTest {

    @ParameterizedTest
    @CsvSource(
            "1, 2, 3",
            "9, 8, 17",
    )
    fun test(x: Int, y: Int, expected: Int) {
        val calc = Calculator()
        val actual = calc.add(x, y)
        assertEquals(expected, actual)
    }

}
```

companion object を使う必要がない
簡単なテストケースであれば `@CsvSource` が使えるため、すっきりする
