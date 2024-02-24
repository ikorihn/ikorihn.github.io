---
title: CPUのx86やarmってなに
date: "2022-04-17T23:26:00+09:00"
tags: 
---

[CPU と命令セットってなに？｜M1 Mac ってなに？ ぼくにも使える？](https://zenn.dev/suzuki_hoge/books/2021-07-m1-mac-4ede8ceb81e13aef10cf)

- アーキテクチャ、命令セット
    - x86: Intel,AMDの32bitアーキテクチャ
    - x64(x86_64): x86を64bitに拡張したもの
    - arm: ARM社のアーキテクチャ
- x86, x86_64
    - Intel: Core i7
    - AMD: Ryzen
        - AMD社の64bit命令セットはAMD64
- ARM 
    - ARM社のアーキテクチャの総称
    - 安価で省電力
    - 64bit拡張のARMv8がある
    - ARMv8の実行モードにAArch32とAArch64がある
    - AArch64 = ARM64
- Apple Silicon
    - Apple社が開発したARMアーキテクチャのチップ

## [Graviton](https://aws.amazon.com/jp/ec2/graviton/)

- AWS Graviton プロセッサは、Amazon EC2 で実行されるクラウドワークロードに最高の料金パフォーマンスを提供するために AWS によって設計されています
- AWS EC2 のインスタンスで Arm アーキテクチャーを使用している
- コスト面やパフォーマンス面でも従来のインスタンスを上回る
- M6gやC6gなどのインスタンスタイプがある
