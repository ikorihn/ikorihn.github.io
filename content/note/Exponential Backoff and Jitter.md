---
title: Exponential Backoff and Jitter
date: 2023-12-10T16:42:00+09:00
---

名前がかっこいい

[Exponential Backoff And Jitter | AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

リトライ時に負荷を分散させるアルゴリズム。
等間隔にリトライするのではなく、実行ごとに間隔をばらけさせることで、スパイクアクセスになるのを避ける

- Exponential Backoff = リトライ間隔を指数関数的に増やす
- Jitter = Exponential Backoffだけでは一定間隔でリトライが行われるため、同時に多数のリトライが発生した場合に実行タイミングが同じになってしまう。これを避けるためにJitterと呼ばれるランダムな時間のずれを設定することで、リトライ間隔に幅をもたせられる。
