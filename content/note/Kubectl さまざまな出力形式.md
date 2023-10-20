---
title: Kubectl さまざまな出力形式
date: 2023-09-01T17:06:00+09:00
tags:
- Kubernetes
---

-o で指定できる出力形式について

https://gist.github.com/so0k/42313dbb3b547a0f51a547bb968696ba

json, wide, name は説明不要

### `custom-columns`

````
kubectl get po -o=custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
````

### `go-template`

Goのtemplate形式で記述可能。制御構文が書ける

````
kubectl get no -o go-template='{{range .items}}{{if .spec.unschedulable}}{{.metadata.name}} {{.spec.externalID}}{{"\n"}}{{end}}{{end}}'
````

### `jsonpath`

aws cli でも使われているJSONPath

````
kubectl get secret my-secret -o jsonpath='{.data}'
# rangeキーワードでforが書ける
kubectl get pods -o jsonpath='{range .items[*]}{..image}{"\n"}{end}'
````
