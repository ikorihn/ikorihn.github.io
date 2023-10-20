---
title: MinIOをローカルのkubernetesで動かす
date: 2023-07-04T12:20:00+09:00
tags:
- 2023/07/04
- Kubernetes
---

[MinIO](note/MinIO.md) を [Kubernetes](note/Kubernetes.md) で動かしたい。

環境は、 [Rancher Desktop](note/Rancher%20Desktop.md) のKubernetes

## manifestをapplyする

https://min.io/docs/minio/kubernetes/upstream/index.html

````shell
curl https://raw.githubusercontent.com/minio/docs/master/source/extra/examples/minio-dev.yaml -O
````

* `spec.volumes[0].hostPath.path` を任意のローカルのパスにする
* `spec.nodeSelector` を `kubernetes.io/os: linux` にする

````shell
kubectl apply -f minio-dev.yaml
````

ローカルから疎通できるようにする

````shell
kubectl port-forward pod/minio 9000 9090 -n minio-dev
````

=> localhost:9000 でコンソールが開いた。

できたけどpod間通信のためにservice作ったりするのが面倒そうなので、helmにしてみる

## helmでデプロイする

MinIOのカスタムリソースを管理するOperatorと、オブジェクトを格納するTenantに分かれているので、まずOperatorをインストールする。

{{< card-link "https://github.com/minio/operator/blob/master/helm/operator/README.md" >}}

次にtenantを入れる。

{{< card-link "https://github.com/minio/operator/blob/master/helm/tenant/README.md" >}}

デフォルトのstorageClassNameがローカルでは存在しなかったので、values.yamlを書いてカスタマイズする。

values_tenant.yaml

````yaml
tenant:
  pools:
    ## Servers specifies the number of MinIO Tenant Pods / Servers in this pool.
    ## For standalone mode, supply 1. For distributed mode, supply 4 or more.
    ## Note that the operator does not support upgrading from standalone to distributed mode.
    - servers: 4
      ## custom name for the pool
      name: pool-0
      ## volumesPerServer specifies the number of volumes attached per MinIO Tenant Pod / Server.
      volumesPerServer: 4
      ## size specifies the capacity per volume
      size: 10Gi
      ## storageClass specifies the storage class name to be used for this pool
      storageClassName: local-path
      ## Used to specify annotations for pods
      annotations: { }
      ## Used to specify labels for pods
      labels: { }
      ## Used to specify a toleration for a pod
      tolerations: [ ]
      ## nodeSelector parameters for MinIO Pods. It specifies a map of key-value pairs. For the pod to be
      ## eligible to run on a node, the node must have each of the
      ## indicated key-value pairs as labels.
      ## Read more here: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/
      nodeSelector: { }
      ## Affinity settings for MinIO pods. Read more about affinity
      ## here: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity.
      affinity: { }
      ## Configure resource requests and limits for MinIO containers
      resources: { }
      ## Configure security context
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        runAsNonRoot: true
      ## Configure container security context
      containerSecurityContext:
        runAsUser: 1000
        runAsGroup: 1000
        runAsNonRoot: true
      ## Configure topology constraints
      topologySpreadConstraints: [ ]
      ## Configure Runtime Class
      # runtimeClassName: ""
````

````shell
helm install --namespace tenant-ns -f values_tenant.yaml --create-namespace tenant minio/tenant

kubectl --namespace tenant-ns port-forward svc/myminio-console 19443:9443
````

=> https://localhost:19443 でコンソールが開く
username:passwordは、デフォルトで `minio:minio123`

## aws cliでs3に接続する

aws-cliのPodを作成して、中からminioにアクセスしてみる。
minioのエンドポイントは、`kubectl logs` でtenantのpodのログに出力されているのを確認する。
`myminio-pool-0-2 minio {"level":"INFO","errKind":"","time":"2023-07-04T03:09:43.126781416Z","message":"S3-API: https://minio.tenant-ns.svc.cluster.local "}`

````shell
kubectl run awscli -it --rm --image amazon/aws-cli --env=AWS_ACCESS_KEY_ID=minio --env=AWS_SECRET_ACCESS_KEY=minio123 --command -- sh

sh-4.2$ aws --endpoint-url https://minio.tenant-ns.svc.cluster.local --no-verify-ssl s3 ls
urllib3/connectionpool.py:1056: InsecureRequestWarning: Unverified HTTPS request is being made to host 'minio.tenant-ns.svc.cluster.local'. Adding certificate verification is strongly advised. See: https://urllib3.readthedocs.io/en/1.26.x/advanced-usage.html#ssl-warnings

sh-4.2$ aws --endpoint-url https://minio.tenant-ns.svc.cluster.local --no-verify-ssl s3 mb s3://my-bucket
urllib3/connectionpool.py:1056: InsecureRequestWarning: Unverified HTTPS request is being made to host 'minio.tenant-ns.svc.cluster.local'. Adding certificate verification is strongly advised. See: https://urllib3.readthedocs.io/en/1.26.x/advanced-usage.html#ssl-warnings
make_bucket: my-bucket

sh-4.2$ aws --endpoint-url https://minio.tenant-ns.svc.cluster.local --no-verify-ssl s3 ls
urllib3/connectionpool.py:1056: InsecureRequestWarning: Unverified HTTPS request is being made to host 'minio.tenant-ns.svc.cluster.local'. Adding certificate verification is strongly advised. See: https://urllib3.readthedocs.io/en/1.26.x/advanced-usage.html#ssl-warnings
2023-07-04 03:54:53 my-bucket
````
