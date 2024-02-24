---
title: circuit breaker pattern
date: "2022-11-18T10:01:00+09:00"
tags:
  - microservice
---

https://learn.microsoft.com/en-us/azure/architecture/framework/resiliency/reliability-patterns

[Make resilient Go net/http servers using timeouts, deadlines and context cancellation · Ilija Eftimov 👨‍🚀](https://ieftimov.com/posts/make-resilient-golang-net-http-servers-using-timeouts-deadlines-context-cancellation/)

マイクロサービスにおいてサービスがダウンしているときに一定時間アクセスを行わないようにすることで回復させやすくするパターン。
電気回路のサーキットブレーカーをオープンすることでショートするのを防ぐのに似ている
