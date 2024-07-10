---
title: jmhを使ってJavaでベンチマークを取る
date: 2024-05-23T18:49:00+09:00
tags:
  - Java
---

Goの `go test -bench` のようにJavaでベンチマークを簡単に取りたかったので調べた。
[jmh](https://github.com/openjdk/jmh) が有名どころのようなので、こちらを使ってみる。

jmhはメソッドなど小さな単位でマイクロベンチマークを取ることができる。
小さなコードを単純に実行するとコードが大きいときには行われない JIT コンパイルなどの最適化がはたらくことで実際よりパフォーマンスが高く出ることがあるが、 JMH はこれを防ぐことでより正確にベンチマークを取ることができるそうだ。

```xml
	<dependencies>
		<dependency>
			<groupId>org.openjdk.jmh</groupId>
			<artifactId>jmh-core</artifactId>
			<version>1.33</version>
		</dependency>
		<dependency>
			<groupId>org.openjdk.jmh</groupId>
			<artifactId>jmh-generator-annprocess</artifactId>
			<version>1.33</version>
			<scope>provided</scope>
		</dependency>

```


```java
package com.example;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.OutputTimeUnit;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.State;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;
import org.openjdk.jmh.runner.options.TimeValue;

@State(Scope.Thread)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
public class Bench {
    private static byte[] body;

    public static void main(String args[]) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(Bench.class.getSimpleName())
                .forks(1)
                .warmupTime(TimeValue.seconds(1))
                .warmupIterations(1)
                .measurementTime(TimeValue.seconds(30))
                .measurementIterations(1)
                .addProfiler("stack")
                .addProfiler("gc")
                .build();
        new Runner(opt).run();
    }

    // 最初の一回だけ実行する処理。teardownもある
    @Setup
    public void prepare() throws IOException {
        String path = "/body.bin";
        try (InputStream is = Bench.class.getResourceAsStream(path);
             BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            body = new byte[is.available()];
            is.read(body);
        }
    }

    @Benchmark
    @BenchmarkMode(Mode.All)
    public static void test() throws InterruptedException {
        // do something using body...
    }
}
```

IDEであればこのmain関数を実行すればベンチマークの結果が出力される。
[[mavenで実行可能jarファイル(Fat Jar)を作成する]] ことで `java -jar` で実行することもできる。

自分でMainを書かずにエントリポイントに `org.openjdk.jmh.Main` を指定すればコマンドライン引数でオプションを設定できる

## 参考

- [GitHub - openjdk/jmh: https://openjdk.org/projects/code-tools/jmh](https://github.com/openjdk/jmh)
- [JMH で Java のコードのベンチマークを取る - sambaiz-net](https://www.sambaiz.net/article/435/)
- [Microbenchmarking with Java | Baeldung](https://www.baeldung.com/java-microbenchmark-harness)