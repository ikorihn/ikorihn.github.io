---
title: PlantUMLでAWS構成図を書く
date: 2021-06-16T18:07:00+09:00
lastmod: 2021-06-16T18:10:50+09:00
tags:
- PlantUML
---

\#PlantUML

[PlantUML](note/PlantUML.md)

[AWS Labs製のPlantUMLライブラリ『AWS Icons for PlantUML』の使い方 - Qiita](https://qiita.com/0hm1/items/1b1e84ef1cc3dab5144d)

AWS Labsのアイコンセットを使う
<https://github.com/awslabs/aws-icons-for-plantuml>

アイコン一覧
<https://github.com/awslabs/aws-icons-for-plantuml/blob/main/AWSSymbols.md>

````puml
@startuml パスPUSHシステム構成

' AWSアイコン
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v10.0/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/Database/DynamoDB.puml
!includeurl AWSPuml/Containers/ElasticContainerService.puml
!includeurl AWSPuml/Compute/Lambda.puml
!includeurl AWSPuml/ApplicationIntegration/APIGateway.puml
!includeurl AWSPuml/ManagementGovernance/CloudWatch.puml
!includeurl AWSPuml/Storage/SimpleStorageService.puml
!includeurl AWSPuml/ApplicationIntegration/SimpleQueueService.puml
!includeurl AWSPuml/ApplicationIntegration/SimpleNotificationService.puml
!includeurl AWSPuml/GroupIcons/Cloud.puml
!includeurl AWSPuml/GroupIcons/CorporateDataCenter.puml
!includeurl AWSPuml/General/Traditionalserver.puml
!includeurl AWSPuml/General/Mobileclient.puml
!includeurl AWSPuml/General/Genericdatabase.puml

' その他アイコン集
!define ICONURL https://raw.githubusercontent.com/tupadr3/plantuml-icon-font-sprites/v2.0.0
!includeurl ICONURL/common.puml
!includeurl ICONURL/font-awesome-5/jenkins.puml

''''
' 見た目の定義
''''
left to right direction

skinparam component {
  ArrowColor #Red
}

''''
' 登場人物の定義
''''

Cloud(aws, cloud, "AWS") {
  DynamoDB(db, DynamoDB, "db")
  Lambda(lambda, Lambda, "実行lambda")
  SimpleQueueService(sqs, SQS, "実行キュー")
  SimpleNotificationService(sns, SNS, "プッシュ配信")
}

node "FCM" as fcm
Mobileclient(app, アプリ, "アプリ")

' font-awesomeのJenkinsアイコン
FA5_JENKINS(jenkins, jenkins)

''''
' コンポーネント図
''''
jenkins --> sqs: 実行命令
sqs --> lambda: 実行
lambda <-> db: 配信データ取得
lambda --> sns: 配信メッセージ登録
sns --> fcm: 配信
fcm --> app: 通知

@enduml
````
