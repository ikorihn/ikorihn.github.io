---
title: ECS container agent
date: 2024-02-09T12:04:00+09:00
tags:
  - ECS
  - AWS
---

[[ECS]] Containerインスタンスの中で動くエージェントで、これを通してインスタンス内のコンテナの管理を行う。

{{< card-link "https://github.com/aws/amazon-ecs-agent" >}}

[Amazon ECS container agent configuration - Amazon Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-agent-config.html)

`/etc/ecs/ecs.config` に設定値を書くことができる
- `ECS_CLUSTER` クラスタ名を指定する
- `ECS_ENGINE_AUTH_DATA` docker registryの認証情報
