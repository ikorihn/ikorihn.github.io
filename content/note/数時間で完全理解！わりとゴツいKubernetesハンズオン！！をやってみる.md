---
title: 数時間で完全理解！わりとゴツいKubernetesハンズオン！！をやってみる
date: "2022-09-19T23:27:00+09:00"
tags:
  - 'Kubernetes'
lastmod: "2022-09-19T23:27:00+09:00"
---

[数時間で完全理解！わりとゴツいKubernetesハンズオン！！ - Qiita](https://qiita.com/Kta-M/items/ce475c0063d3d3f36d5d)

ちょっと古いけど一通り体験するのによさそう

## 下準備

docker-desktopに名前が変わっているみたい

いきなり躓いた。`github.com/~~` の書き方はdeprecatedになっていた

https://kubernetes.github.io/ingress-nginx/deploy/#quick-start

```shell
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.1/deploy/static/provider/cloud/deploy.yaml
```


```shell
$ git clone git@github.com:kubernetes/examples.git
$ vim examples/guestbook/all-in-one/frontend.yaml
# replicasを1に変える

k apply -f ./examples/guestbook/all-in-one/guestbook-all-in-one.yaml
```

### kind: Ingress はdeprecated

https://kubernetes.io/docs/reference/using-api/deprecation-guide/#ingress-v122

- `networking.k8s.io/v1` API version に変更
- `serviceName` を `service.name` など細かい変更
- `ingressClassName: nginx` は `kubernetes/ingress-nginx` で作成したIngressClassを指定する

```shell
$ k get ingressclass 
NAME    CONTROLLER             PARAMETERS   AGE
nginx   k8s.io/ingress-nginx   <none>       18m
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: guestbook-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Exact
        backend:
          service:
            name: frontend
            port:
              number: 80
```

