---
title: Java OpenTelemetry 自動計装と手動計装を組み合わせてトレースを取得する
date: 2024-06-03T15:48:00+09:00
tags:
  - Java
  - OpenTelemetry
---

## モチベーション

[[OpenTelemetry]] でトレースを取得するにあたって、設定は環境変数で行い、基本的には自動計装にまかせつつ、自動計装で取れない(外部通信を行っていない)ところにだけ手動でspanを追加したかった。

## 方法

[[Java OpenTelemetry agentによる自動計装]] でjavaagent、OTELの設定をする

```shell
export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="your-service-name"
```

アプリケーションコード内のトレースを取得したい箇所で

```java
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 現在のスコープのSpanを取得、attributeをセットすることもできる
        Span.current().setAttribute("url.path", req.getRequestURI());

        // ... トレースを取得したい区間

        // サブメソッドにspanオブジェクトを渡す必要は特にない
        childMethod();
    }

    private void childMethod() {
        // 自動計装によって初期化されているグローバルオブジェクトからTracerを取得
        Tracer tracer = GlobalOpenTelemetry.getTracer(SERVICE_NAME);
        // ネストしたspanを作成
        Span parentSpan = tracer.spanBuilder("childMethod").startSpan();

        try (Scope parentScope = parentSpan.makeCurrent()) {
            Span span = tracer.spanBuilder("sub1").startSpan();
            // ... トレースを取得したい区間1
            span.end();
            span = tracer.spanBuilder("sub2").startSpan();
            // ... トレースを取得したい区間2
            span.end();

        } finally {
            parentSpan.end();
        }
    }
```

APIハンドラーでは、自動計装によりSpanが作成されているのでそれを使う。

よくわかっていなかったが、 `Scope scope = span.makeCurrent()` をすると `scope.close()` するまでは `Context.current()` や `Span.current()` で現在のcontextを取得できるので、別メソッドを呼び出すときにSpanオブジェクトを渡す必要はない。

## 参考

- [Add Custom Attribute with Auto Instrumentation · open-telemetry/opentelemetry-java-instrumentation · Discussion #6458 · GitHub](https://github.com/open-telemetry/opentelemetry-java-instrumentation/discussions/6458)
- [Manual instrumentation of Java applications with OpenTelemetry — Elastic Observability Labs](https://www.elastic.co/observability-labs/blog/manual-instrumentation-java-apps-opentelemetry)