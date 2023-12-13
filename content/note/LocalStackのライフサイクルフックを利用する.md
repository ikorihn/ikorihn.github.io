---
title: LocalStackのライフサイクルフックを利用する
date: 2023-12-10T17:39:00+09:00
tags:
- AWS
---

[Initialization Hooks | Docs](https://docs.localstack.cloud/references/init-hooks/)

* BOOT：コンテナは起動してるが LocalStack はまだ開始していない状態
* START：Pythonプロセスが実行中になり、LocalStack実行環境が開始中の状態
* READY：LocalStackがリクエストを受け付けられる状態
* SHUTDOWN：LocalStackがシャットダウンしてる状態

`/etc/localstack/init/{boot.d,start.d,ready.d,shutdown.d}` の下にスクリプトを置くことで実行される。
スクリプトは sh または py で書く
