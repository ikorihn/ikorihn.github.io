---
title: Java OpenTelemetry agent
date: 2024-04-10T11:57:00+09:00
tags:
  - Java
  - OpenTelemetry
---

[[OpenTelemetry]] が公式で提供している自動計装の機能によって、ソースコードに手を入れずにテレメトリを取得できるようになります。
Javaの場合、javaagentを指定することで自動計装が有効になります。

[[SpringBoot]] の例に関しては公式で紹介されているので、ここではJAX-RSで作成されたWebサーバに導入してみます。

`pom.xml`

```xml
<project>
    <build>
        <plugins>
            <!-- jettyでサーバを起動するためのプラグイン。otelとは関係なし -->
            <plugin>
              <groupId>org.codehaus.cargo</groupId>
              <artifactId>cargo-maven3-plugin</artifactId>
              <version>1.10.12</version>
              <configuration>
                <configuration>
                  <properties>
                    <cargo.jvmargs>-Xmx4096m --add-opens=java.base/java.lang=ALL-UNNAMED</cargo.jvmargs>
                  </properties>
                </configuration>
              </configuration>
            </plugin>
        </plugins>
    </build>

    <dependencies>
        <dependency>
            <!-- otel exporter -->
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-otlp</artifactId>
            <version>1.36.0</version>
        </dependency>
    </dependencies>
</project>
```


### agentをダウンロードする

```shell
curl -LO https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### アプリケーション起動時の環境変数にOTELの設定をする

環境変数でもろもろ設定するだけで、計装とexportが行われます。

OpenTelemetry Collectorに送信する

```shell
export JAVA_TOOL_OPTIONS="-javaagent:$(pwd)/opentelemetry-javaagent.jar" OTEL_METRIC_EXPORT_INTERVAL=15000 OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 OTEL_TRACES_EXPORTER=otlp OTEL_SERVICE_NAME=my-app
```

コンソールで確認する場合

```shell
export JAVA_TOOL_OPTIONS="-javaagent:$(pwd)/opentelemetry-javaagent.jar" OTEL_TRACES_EXPORTER=logging OTEL_METRICS_EXPORTER=logging OTEL_LOGS_EXPORTER=logging OTEL_METRIC_EXPORT_INTERVAL=15000
```

サーバを起動する

```shell
mvn -Dmaven.test.skip=true package cargo:run
```
