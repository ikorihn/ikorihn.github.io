---
title: Athena aws-sdk-go-v2で結果をS3からダウンロードする
date: 2023-11-08T13:50:00+09:00
tags:
- Athena
- Go
---

[Athena aws-sdk-go-v2で結果を取得する](note/Athena%20aws-sdk-go-v2で結果を取得する.md) で [Athena](note/Athena.md) のAPIを使って結果を取得することができるが、
サイズが大きいときにページネーションを考慮したりメモリを使用するので
