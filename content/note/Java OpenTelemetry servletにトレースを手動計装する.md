---
title: Java OpenTelemetry servletにトレースを手動計装する
date: 2024-05-31T10:21:00+09:00
tags:
  - Java
  - OpenTelemetry
---


自動計装は[[Java OpenTelemetry agentによる自動計装]] で簡単にできた。
手動計装もドキュメントにしたがってやれば簡単に導入できるが、古めのservletにどうやって実装すればいいかはよくわからなかったのでメモ

2024-06-03 追記 自動計装+必要なところに手動計装っていう組み合わせができた -> [[Java OpenTelemetry 自動計装と手動計装を組み合わせてトレースを取得する]]

## 依存関係追加

[Instrumentation | OpenTelemetry](https://opentelemetry.io/docs/languages/java/instrumentation/) にあるライブラリを追加する

`pom.xml`

```diff
+       <dependencyManagement>
+               <dependencies>
+                       <dependency>
+                               <groupId>io.opentelemetry</groupId>
+                               <artifactId>opentelemetry-bom</artifactId>
+                               <version>1.38.0</version>
+                               <type>pom</type>
+                               <scope>import</scope>
+                       </dependency>
+               </dependencies>
+       </dependencyManagement>
+
        <dependencies>
+               <dependency>
+                       <groupId>io.opentelemetry</groupId>
+                       <artifactId>opentelemetry-api</artifactId>
+               </dependency>
+               <dependency>
+                       <groupId>io.opentelemetry</groupId>
+                       <artifactId>opentelemetry-sdk</artifactId>
+               </dependency>
+               <dependency>
+                       <groupId>io.opentelemetry</groupId>
+                       <artifactId>opentelemetry-exporter-otlp</artifactId>
+               </dependency>
+               <dependency>
+                       <!-- 使っているservletのバージョンにあわせる -->
+                       <groupId>io.opentelemetry.instrumentation</groupId>
+                       <artifactId>opentelemetry-servlet-3.0</artifactId>
+                       <version>1.6.2-alpha</version>
+               </dependency>
+               <dependency>
+                       <!-- Not managed by opentelemetry-bom -->
+                       <groupId>io.opentelemetry.semconv</groupId>
+                       <artifactId>opentelemetry-semconv</artifactId>
+                       <version>1.25.0-alpha</version>
+               </dependency>
+

```


## SDKを初期化

`io.opentelemetry.api.OpenTelemetry` を初期化し、 `buildAndRegisterGlobal()` で `GlobalOpenTelemetry` にsetする。
初期化は一回だけで、二回目以降setしようとすると怒られる。

やり方はいろいろあるが、ここではsingletonで初期化した。

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.semconv.ResourceAttributes;

public class OpenTelemetryManager {
    private static final OpenTelemetryManager INSTANCE = new OpenTelemetryManager();

    private static OpenTelemetry openTelemetry;

    private OpenTelemetryManager() {
        OtlpGrpcSpanExporter spanExporter = OtlpGrpcSpanExporter.builder().build();
        Resource resource = Resource.getDefault().toBuilder().put(ResourceAttributes.SERVICE_NAME, "my-service").build();

        SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
                .addSpanProcessor(BatchSpanProcessor.builder(spanExporter).build())
                .setResource(resource)
                .build();
        this.openTelemetry = OpenTelemetrySdk.builder()
                .setTracerProvider(tracerProvider)
                .setPropagators(ContextPropagators.create(TextMapPropagator.composite(W3CTraceContextPropagator.getInstance(),
                        W3CBaggagePropagator.getInstance())))
                .buildAndRegisterGlobal();
    }

    public static OpenTelemetry getOpenTelemetry() {
        return INSTANCE.openTelemetry;
    }

    public static Tracer provideTracer() {
        return INSTANCE.openTelemetry.getTracer("io.opentelemetry.example");
    }
}
```


## トレースを取得

```java
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;

public class MyServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
        Tracer tracer = OpenTelemetryManager.provideTracer();
        // spanを作成
        Span parentSpan = tracer.spanBuilder(req.getRequestURI()).startSpan();

        // scopeを作成(auto closeする)
        try (Scope parentScope = parentSpan.makeCurrent()) {

            // ネストしたspanを作成
            Span span = tracer.spanBuilder("very start")
                    .setParent(Context.current().with(parentSpan))
                    .startSpan();
            Scope scope = span.makeCurrent();

            // do something....

            // 次の区間のトレースを取る場合は一度クローズして作り直す
            scope.close();
            span.end();
            span = tracer.spanBuilder("start asHtml")
                    .setParent(Context.current().with(parentSpan))
                    .startSpan();
            scope = span.makeCurrent();

            // do something....

            scope.close();
            span.end();

        } finally {
            // spanをクローズ
            parentSpan.end();
        }
    }

}
```


