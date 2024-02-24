---
title: colimaをM1 Macで動かす
date: 2024-02-01T17:52:00+09:00
tags:
  - Docker
---

{{< card-link "https://github.com/abiosoft/colima" >}}

最小限の設定だけでmacOSやLinuxで動くcontainer runtime。
VMはlimaを使っている。

## port mappingを有効にするには

macOSではデフォルトで、VMに到達可能なIPアドレスが振られないようになっている。
これを有効にしないと、`-p` をつけてdocker runしてもportがマッピングされない。

ただし有効にするにはルート権限が必要で、colimaの起動も遅くなる。

https://github.com/abiosoft/colima/blob/main/docs/FAQ.md#enable-reachable-ip-address

```diff title:~/.colima/default/colima.yaml
network:
-  address: false
+  address: true
```
