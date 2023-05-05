---
title: Java BigDecimalにdoubleを渡したとき誤差がでる
date: 2023-03-30T16:23:00+09:00
tags:
- 2023/03/30
- Java
lastmod: 2023-03-30T16:23:00+09:00
---

Javaで正確な数値計算を行うため BigDecimal を使っていたが、BigDecimalをdoubleで初期化したあと、小数点以下で四捨五入したところ誤差が出てしまった。

[BigDecimalで誤差が出てしまった話 - たけぼーの備忘録](https://tks-lab.hatenablog.com/entry/2017/03/03/131427)

`BigDecimal`を使用して正確な数値計算を行う場合、`double`で初期化することは避けたほうが良いです。`double`は浮動小数点数であり、多くの10進数は正確に表現できません。そのため、`double`で初期化した`BigDecimal`はすでに誤差を含んでいる可能性があります。

`BigDecimal`を初期化する際には、`String`型の値や`BigInteger`型の値を利用してください。例えば：

````java
BigDecimal bd = new BigDecimal("123.456");

````

この方法で初期化すると、`BigDecimal`は正確な10進数値を保持します。

小数点以下で四捨五入を行う場合は、`setScale`メソッドを使用し、`RoundingMode`を指定します。

````java
import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        BigDecimal bd = new BigDecimal("123.456");
        BigDecimal rounded = bd.setScale(2, RoundingMode.HALF_UP);
        System.out.println(rounded);
    }
}
````

この例では、小数点以下2桁で四捨五入された結果が得られます。正確な数値計算を行うためには、`BigDecimal`の初期化と四捨五入の両方で適切な方法を使用してください。
