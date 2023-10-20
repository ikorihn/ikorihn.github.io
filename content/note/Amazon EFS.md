---
title: Amazon EFS
date: 2023-02-09T11:15:00+09:00
tags:
- 2023/02/09
- AWS
lastmod: 2023-02-09T11:16:00+09:00
---

[Amazon EFS パフォーマンス - Amazon Elastic File System](https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html)

## スループットモードについて

[NEW – Amazon EFS Elastic Throughput の発表 | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/new-announcing-amazon-efs-elastic-throughput/)

 > 
 > 新しいスループットモードで、アプリケーションに必要なだけのスループットを従量制料金で提供するように設計されています。この新しいスループットモードでは、プロビジョニングやキャパシティ管理を必要としない共有ファイルストレージを提供することで、AWS でのワークロードとアプリケーションの実行をさらに簡素化できます。
 > Elastic Throughput は、予測が困難なパフォーマンス要件を伴い、かつ、急激に増減する予測不可能なワークロードに最適です。

2022/11に新しいスループットモード Elastic Throughputが発表された。プロビジョニングしなくても、アプリケーションが必要とするスループットパフォーマンスを自動で決定してくれる。予測が難しいときにはこれを選ぶのがいいみたい。

 > 
 > アプリケーションのスループットが Bursting モードで制限されている場合 (例えば、許容スループットの 80% 超を使用している、またはバーストクレジットを使い果たしている)、Provisioned モード ([2018 年に発表](https://aws.amazon.com/blogs/aws/new-provisioned-throughput-for-amazon-elastic-file-system-efs/)) または新しい Elastic Throughput モードの使用をご検討ください。

[Amazon EFS バーストクレジットを理解する](https://aws.amazon.com/jp/premiumsupport/knowledge-center/efs-burst-credits/)

### Bursting Throughput

File-based workloads are typically spiky, driving high levels of throughput for short periods, but driving lower levels of throughput for longer periods. Amazon EFS is designed to burst to high throughput levels for periods of time.

Amazon EFS uses a credit system that determines when file systems can burst. If the credit balance of your file system drops to zero, then your permitted throughput rate drops to your baseline throughput. When driving at baseline throughput, you use credits at the same rate you earn them.

EFSの読み書きの高低差が激しい利用方法の場合に、利用されているスループットがベースラインを下回っている期間、クレジットとして性能を蓄積していく。スループットが大きいときは蓄積したクレジットを使って性能を上げる
CloudWatch の BurstCreditBalance のメトリクスで見ることができる。

baseline rate is 50 MiBps per tebibyte \[TiB\] of storage (equivalent to 50 KiBps per GiB of storage). Amazon EFS meters read operations up to one-third the rate of write operations, permitting the file system to drive a baseline rate up to 150 KiBps per GiB of read throughput, or 50 KiBps per GiB of write throughput.

ベースラインはデータ量に応じて決まる。データ量1GiBあたり50KiB/sの読み書きがベースラインとなる。
ただしreadはwriteの1/3で計算される。

### Provisioned Throughput

With Provisioned Throughput mode, you can instantly provision the throughput of your file system independent of the amount of data stored
