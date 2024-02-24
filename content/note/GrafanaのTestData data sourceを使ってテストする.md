---
title: GrafanaのTestData data sourceを使ってテストする
date: 2024-01-22T12:20:00+09:00
tags:
  - Observability
  - Grafana
---

[[Grafana]] の [TestData data source](https://grafana.com/docs/grafana/latest/datasources/testdata/)
を使うとモックデータを作成してダッシュボードの見た目を確認したり、アラートの発火条件を確認したりできる。


今まで知らずに[[Grafana Alertを設定する|勘でアラートを設定していた]]

## 使い方

Datasourcesの設定から `TestData` を探して追加する。

ダッシュボードの画面で、panelを追加してデータソースをTestDataに変えると、モックデータ作成の入力欄が出てくるので、好きな値をセットする。
Random Walkデータや、CSVによる指定ができたりする。
