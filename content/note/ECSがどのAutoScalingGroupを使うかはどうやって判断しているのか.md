---
title: ECSがどのAutoScalingGroupを使うかはどうやって判断しているのか
date: 2024-02-09T11:47:00+09:00
tags:
  - ECS
  - AWS
---

既存の [[ECS]] クラスターがon EC2で運用していて、どうやってASGと紐づいているのか知らなかったので調べた

## EC2のuser dataで指定する

[Bootstrapping container instances with Amazon EC2 user data - Amazon Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/bootstrap_container_instance.html)

EC2インスタンス起動時に実行されるuser dataスクリプトで、 `/etc/ecs/ecs.config` に `ECS_CLUSTER` の設定値を書くだけでよい。

```shell
#!/bin/bash
echo "ECS_CLUSTER=MyCluster" >> /etc/ecs/ecs.config
```


ECS-optimized AMIが[[ECS container agent]] を起動するとき、 `/etc/ecs/ecs.config` に書かれたagent設定を見る。

ほかにもinstance attributeや、 [spot instance中断時の自動ドレイン](https://dev.classmethod.jp/articles/ecs-spotinstance-draining/) を設定できる
```shell
#!/bin/bash
cat <<'EOF' >> /etc/ecs/ecs.config
ECS_INSTANCE_ATTRIBUTES={"envtype":"prod"}
ECS_ENABLE_SPOT_INSTANCE_DRAINING=true
EOF
```


## CloudFormationで作るなら

こちらのようにできる。

[[AWS] ECSでスポットインスタンス混在クラスターを使うCFnテンプレート | 個人利用で始めるAWS学習記](https://noname.work/3788.html)
https://github.com/noname-work/aws-cloudformation/blob/master/ecs/ecs-on-ec2/create-ecs-on-ec2-cluster.yml#L61C1-L138C1

```
Resources:
  # ECSクラスターの作成
  EcsCluster:
    Type: "AWS::ECS::Cluster"
    Properties: 
      ClusterName: !Ref "ClusterName"
      # ContainerInsightsを利用する設定。追加料金が発生するが細かなメトリクスを確認できる。
      ClusterSettings: 
        - Name: "containerInsights"
          # 詳細な監視が必要な場合はenabledにしておく
          Value: "disabled"
      Tags: 
        - Key: "Name"
          Value: !Ref "ClusterName"

  # AutoScalingグループの作成
  AutoScaling:
    Type: "AWS::AutoScaling::AutoScalingGroup"
    # インスタンス更新時のアップデート設定
    UpdatePolicy:
      # ローリングアップデートの設定
      AutoScalingRollingUpdate:
        # 1台ずつ変更
        MaxBatchSize: "1"
        # アップデート中に最低でも1台はインスタンスが起動するようにする
        MinInstancesInService: "1"
    Properties: 
      AutoScalingGroupName: !Sub "${ClusterName}-asg"
      # 次のスケーリングアクションまでの待機時間
      Cooldown: "300"
      # 実行するインスタンスの希望数
      DesiredCapacity: !Ref "ScalingDesiredCapacity"
      # インスタンスの最大数
      MaxSize: !Ref "ScalingMaxSize"
      # インスタンスの最小数
      MinSize: !Ref "ScalingMinSize"
      # インスタンスの起動設定
      LaunchConfigurationName: !Ref "LaunchConfiguration"
      # インスタンスを停止する時のルール
      TerminationPolicies: 
        - "OldestInstance"
      VPCZoneIdentifier: !Ref "ECSSubnetIDs"
      Tags: 
        - Key: "Name"
          Value: !Sub "${ClusterName}-ecs-instance"
          PropagateAtLaunch: "true"

  # AutoScaling起動設定の作成
  LaunchConfiguration:
    Type: "AWS::AutoScaling::LaunchConfiguration"
    Properties: 
      # 自動にパブリックIPを割り当てるかどうか
      AssociatePublicIpAddress: true
      BlockDeviceMappings: 
        - DeviceName: "/dev/xvda"
          Ebs: 
            VolumeType: "gp3"
            VolumeSize: "30"
      # EBSをスループット最適化モードにするか
      EbsOptimized: "false"
      # ECSにアタッチするインスタンスプロファイル
      IamInstanceProfile: !Ref "EcsInstanceProfile"
      # 実行するAMI
      ImageId: !Ref "ImageId"
      # 詳細メトリクスを有効にするか
      InstanceMonitoring: "false"
      # インスタンスタイプ
      InstanceType: !Ref "InstanceType"
      # EC2インスタンスのキーペア
      KeyName: !Ref "KeyName"
      # EC2に紐づけるセキュリティグループ
      SecurityGroups: !Ref "ECSSecurityGroups"
      # ECSクラスターに紐づけるためのユーザーデータ
      UserData: 
        Fn::Base64: !Sub |
          #!/bin/bash
          echo "ECS_CLUSTER=${ClusterName}" >> /etc/ecs/ecs.config
```
