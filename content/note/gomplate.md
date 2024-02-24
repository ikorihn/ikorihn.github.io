---
title: gomplate
date: "2021-06-09T18:59:00+09:00"
lastmod: '2021-06-09T18:59:51+09:00'
tags:
  - 'Go'

---

#Go

https://docs.gomplate.ca/installing/

goのテンプレートエンジン

使い方

```shell
$ echo 'My voice is my {{.Env.THING}}. {{(datasource "vault").value}}' \
  | docker run -i -e THING=passport -v /home/me/.vault-token:/root/.vault-token hairyhenderson/gomplate -d vault=vault:///secret/sneakers -f -
My voice is my passport. Verify me.
````
