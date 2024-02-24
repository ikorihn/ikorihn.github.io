---
title: CoreDNSの名前解決の仕組み
date: 2024-01-25T17:33:00+09:00
tags:
  - Kubernetes
---

- [EKSコンテナ移行のトラブル事例：推測するな計測せよ -CoreDNS暴走編- - MonotaRO Tech Blog](https://tech-blog.monotaro.com/entry/2023/08/24/090000)
- [Kubernetes と名前解決](https://zenn.dev/toversus/articles/d9faba80f68ea2)
- [EKSのCoreDNSを安定させるための取り組み - Stanby Tech Blog](https://techblog.stanby.co.jp/entry/EKS_Coredns)
- [Kubernetesのキャッシュネームサーバとリゾルバ | IIJ Engineers Blog](https://eng-blog.iij.ad.jp/archives/18147)
- [Amazon EKS での DNS の障害のトラブルシューティング | AWS re:Post](https://repost.aws/ja/knowledge-center/eks-dns-failure)


## Podの `/etc/resolve.conf` の中身をみる

podに入って見てみると、以下のような設定がされている。

```
search <namespace>.svc.cluster.local svc.cluster.local cluster.local ap-northeast-1.compute.internal
nameserver 172.20.0.10
options ndots:5
```

- `nameserver` はCoreDNSのIPアドレス
- `search` に書かれたサーチリストはドットの数が `ndots` の値以下のドメイン名を名前解決するときにsuffixで順番に付与される
    - `example` というホスト名は、 `example.default.svc.cluster.local` `example.svc.cluster.local` `example.cluster.local` `example.example.com` と問い合わせた後で `example` を問い合わせる
    - ただし、`example.` と末尾にdotがついていればこれをFQDNとみなす

### これによって何が起こるか

`www.foo.bar.com` といったドメインを名前解決するのに、無駄なクエリが4回発行される。

### 設定変更する

これはPodの `spec.dnsConfig` や `spec.dnsPolicy` で設定できる。

[DNS for Services and Pods | Kubernetes](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)

### DNS Policy


> [!warning]
> dnsPolicyのデフォルト値は `Default`  ではなくて `ClusterFiest`

- `Default`: Podが動いているNodeのresolve.confを引き継ぐ
- `ClusterFirst`: cluster domain suffixにマッチしないドメイン(`www.kubernetes.io` など)に対するDNS queryは上流のnameserverに流す。クラスタドメインがサーチリストに設定される
- `None`: 何も設定されないので、`dnsConfg` で自分で設定をする

