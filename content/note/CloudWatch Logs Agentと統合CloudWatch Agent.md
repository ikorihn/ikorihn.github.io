---
title: CloudWatch Logs Agentと統合CloudWatch Agent
date: 2024-02-09T12:59:00+09:00
tags:
  - AWS
---

EC2に `awslogs` ってのがインストールされているがなんなのかよくわからなかったので調べた。

## CloudWatch Logs Agent(非推奨)

https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/QuickStartEC2Instance.html

`yum install -y awslogs` でインストールできる。
もうアップデートされていないし、古いバージョンのPythonに依存してたりするのでよくない。

https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/QuickStartEC2Instance.html
> 古いログエージェントは廃止する予定です。CloudWatch には、EC2 インスタンスとオンプレミスサーバーからログとメトリックスの両方を収集できる統合エージェントが含まれています。詳細については、「CloudWatch Logs の開始方法」を参照してください。
> 古い CloudWatch Logs エージェントから統合エージェントへの移行については、「ウィザードを使用して CloudWatch エージェント設定ファイルを作成する」を参照してください。
> 古いログエージェントは、Python の 2.6 から 3.5 までのバージョンしかサポートしていません。さらに、古い CloudWatch Logs エージェントでは、インスタンスメタデータサービスバージョン 2 (IMDSv2) がサポートされていません。サーバーで IMDSv2 を使用している場合は、古い CloudWatch Logs エージェントではなく、新しい統合エージェントを使用する必要があります。
> このセクションの残りの部分では、古い CloudWatch Logs エージェントをまだ使用しているお客様向けに、その使用方法について説明します。

だいぶ前から非推奨になっていて IMDSv2では削除される

## unified CloudWatch Agent

現在はunified CloudWatch Agent(統合CloudWatch Agent)を使うよう案内されている。

[awslogsとamazon-cloudwatch-agentの違い | DEVLABO](https://dev-labo.com/aws/awslogs-amazon-cloudwatch-agent-difference/)
https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/UseCloudWatchUnifiedAgent.html
