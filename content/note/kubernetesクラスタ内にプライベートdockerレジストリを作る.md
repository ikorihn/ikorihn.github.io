---
title: kubernetesクラスタ内にプライベートdockerレジストリを作る
date: 2023-01-04T18:44:00+09:00
tags:
- 2023/01/04
- Docker
- Kubernetes
---

サンプルだとよくECRやGCRにコンテナイメージをアップロードするように言われるが、とりあえずローカルで確認したいときに、Kubernetesクラスタ内にdockerレジストリを作る方法について調べた。

## registryを作成

[Using a Local Registry with Minikube](https://gist.github.com/trisberg/37c97b6cc53def9a3e38be6143786589)

https://hub.docker.com/\_/registry を使う

docker-registry.yaml

````yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: docker-registry
  labels:
    app: docker-registry
spec:
  replicas: 1
  selector:
    matchLabels:
      app: docker-registry
  template:
    metadata:
      labels:
        app: docker-registry
    spec:
      containers:
      - name: docker-registry
        image: registry:2.8
        ports:
        - containerPort: 5000
        volumeMounts:
        - name: registry
          mountPath: /var/lib/registry
      volumes:
      - name: registry
        hostPath:
          type: Directory
          path: /tmp/.registry/storage
---
kind: Service
apiVersion: v1
metadata:
  name: docker-registry
spec:
  ports:
  - name: "http-port"
    protocol: TCP
    port: 5000
    targetPort: 5000
  selector:
    app: docker-registry
````

````shell
$ kubectl apply -f docker-registry.yaml
````

### 確認

適当なpodを作って、疎通確認

pod-nginx.yaml

````yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
````

````shell
$ kubectl apply -f pod-nginx.yaml
$ kubectl exec nginx -it -- bash
root@nginx:/# curl docker-registry:5000/v2/_catalog
{"repositories":["v2/my_app"]}
````

## kanikoのイメージアップロード先を指定

https://github.com/GoogleContainerTools/kaniko

````yaml
apiVersion: v1
kind: Pod
metadata:
  name: kaniko
spec:
  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:latest
      args:
        - "--insecure"
        - "--dockerfile=<path to Dockerfile within the build context>"
        - "--context=<path to Dockerfile context dir>"
        - "--destination=docker-registry:5000/myapp:version"
````

````shell
$ kubectl apply -f kaniko.yaml
````

### `http: server gave HTTP response to HTTPS client` エラーが出た

https://github.com/GoogleContainerTools/kaniko#flag---insecure

kaniko 実行時に `--insecure` オプションをつける
