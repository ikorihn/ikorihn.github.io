---
title: Docker in Docker
date: 2024-02-10T16:20:00+09:00
---

dind
[[Docker]] コンテナ内でDockerを使うこと。
CIなどで、ランナーをDockerコンテナにしてその中でDockerイメージをビルドしたいときなどに利用する。

DinDは、特権モードでコンテナを実行(`--privileged`)して、ホストのリソースを自由に使えるようにしておいて、内部で独自にDocker環境を構築する。

ホストのDocker daemonのソケットファイルをマウントするDocker outside of Docker (DooD)もある。

DinDは特権モードを使うためセキュリティに問題があり、リソースもくうのでパフォーマンスが良くないという。
