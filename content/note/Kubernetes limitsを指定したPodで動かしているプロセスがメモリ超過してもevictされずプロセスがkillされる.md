---
title: Kubernetes limitsを指定したPodで動かしているプロセスがメモリ超過してもevictされずプロセスがkillされる
date: "2023-01-26T15:43:00+09:00"
tags:
  - '2023/01/26'
  - 'Kubernetes'
---

[[kubernetes resourcesの設定値について Kubernetes]]

`command: ['sleep', '3600']` とかで起動したpodにexecで入って `yes` コマンド等で負荷をかけても、`yes` のプロセスがkillされるだけでpodはevictされなかった。
ドキュメント読む限りpodがevictされるのかと思ったがそうじゃない？

こちらに書いてあった
https://dunkshoot.hatenablog.com/entry/kubernetes_manage_resource#limits-%E3%82%92%E8%B6%85%E3%81%88%E3%81%A6%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%A7%E3%81%8D%E3%81%AA%E3%81%84%E3%83%A1%E3%83%A2%E3%83%AA

起動時のコマンドのプロセスがlimitsに達したとき、podがkillされる(想定通り)

killされた理由がどこかに出力されているのかはわからなかった。
describe pod すると負荷かけたコンテナのほうにOOMKilledが出ているのはわかった

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
    spec:
      containers:
      - name: busybox # こちらはkillされない
        image: busybox:latest
        command: ['sh', '-c', 'echo "Hello, Kubernetes!" && sleep 3600']
        resources:
          requests:
            cpu: "100m"
            memory: "64M"
          limits:
            cpu: "200m"
            memory: "128M"
      - name: stress # killされる
        image: polinux/stress:latest
        command: ['stress']
        args: ["--vm", "1", "--vm-bytes", "256M", "--vm-hang", "1"]
        resources:
          requests:
            cpu: "100m"
            memory: "64M"
          limits:
            cpu: "200m"
            memory: "128M"
```
