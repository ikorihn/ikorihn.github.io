---
title: Grafana database is lockedのエラーがでてアラート設定などが更新できない
date: "2023-05-30T16:00:00+09:00"
tags:
  - '2023/05/30'
  - Grafana
---

[[Grafana]]でアラートルールを更新した際に、`database is locked` とエラーがでて更新ができない場合がある。
これはsqliteのDBがロックされた状態になってしまって発生している。

[Grafana, SQLite, and database is locked - handle it like a pro!](https://opsverse.io/2022/12/15/grafana-sqlite-and-database-is-locked/)

initContainerで、sqliteのdbファイルを作り直すことで解消する

```
  initContainers:
    - command:
        - /bin/sh
        - '-c'
        - >-
          cd /var/lib/grafana;
          cp -a grafana.db grafana.db.bak;
          /usr/bin/sqlite3 grafana.db.bak '.clone /var/lib/grafana/grafana.db.clone';
          mv grafana.db.clone grafana.db;
          chmod a+w grafana.db
      image: keinos/sqlite3
      imagePullPolicy: IfNotPresent
      name: sqlite
      resources: {}
      securityContext:
        runAsNonRoot: false
        runAsUser: 0
      volumeMounts:
        - mountPath: /var/lib/grafana
          name: storage
```

[Grafana Helm Chart](https://github.com/grafana/helm-charts/tree/main/charts/grafana)の場合、`extraInitContainers` に指定する

```yaml
extraInitContainers:
  - name: grafanadb-clone-and-replace
    image: keinos/sqlite3
    command:
    - "/bin/sh"
    - "-c"
    - "/usr/bin/sqlite3 /var/lib/grafana/grafana.db '.clone /var/lib/grafana/grafana.db.clone'; mv /var/lib/grafana/grafana.db.clone /var/lib/grafana/grafana.db; chmod a+w /var/lib/grafana/grafana.db"
    imagePullPolicy: IfNotPresent
    securityContext:
      runAsUser: 0
    volumeMounts:
    - name: storage
  mountPath: "/var/lib/grafana"
```


## が、駄目・・・！

sqliteファイルが作り直されはするのだが、再度設定を更新しようとすると同じエラーになる。

https://github.com/grafana/grafana/issues/64798

grafana.iniに追記するといいという情報もあったが、これでも解消はしなかった。というかGrafanaがとても重くなり画面操作ができない
```toml
[database]
wal = true
```

どうにもならないので一旦諦めた…もう設定更新はしない。次回アップデートに任せる
