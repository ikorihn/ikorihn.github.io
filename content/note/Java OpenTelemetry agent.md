
`pom.xml`

```xml
<project>
    <build>
        <plugins>
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
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-otlp</artifactId>
            <version>1.36.0</version>
        </dependency>
    </dependencies>
</project>
```

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

### OTel collectorに送信する
export JAVA_TOOL_OPTIONS="-javaagent:$(pwd)/opentelemetry-javaagent.jar" OTEL_METRIC_EXPORT_INTERVAL=15000 OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 OTEL_TRACES_EXPORTER=otlp OTEL_SERVICE_NAME=my-app

### コンソールで確認する
# export JAVA_TOOL_OPTIONS="-javaagent:$(pwd)/opentelemetry-javaagent.jar" OTEL_TRACES_EXPORTER=logging OTEL_METRICS_EXPORTER=logging OTEL_LOGS_EXPORTER=logging OTEL_METRIC_EXPORT_INTERVAL=15000

mvn -Dmaven.test.skip=true package cargo:run
```
