---
title: Grafana ダッシュボードやアラートのexport import
date: 2023-05-16T19:29:00+09:00
tags:
- 2023/05/16
- Grafana
---

[Grafana](note/Grafana.md) にて8.xから9.xへダッシュボードを移行したい。ダッシュボードはexport/importでいけるがアラートがインポートされなくて困った

9.x以降のAlertは設定方法が変わった。
exportの機能がついたが、以前のバージョンからインポートするのは簡単じゃなさそう

https://community.grafana.com/t/ngalert-grafana-8-alert-feature-how-to-export-import-alerts-as-yml-json/51677/22
このコメントの通りにすればできそう

## 9.0より前のバージョンではAlerting APIが使えた

* [Alerting HTTP API | Grafana documentation](https://grafana.com/docs/grafana/latest/developers/http_api/alerting/)
* [Alerting Notification Channels HTTP API | Grafana documentation](https://grafana.com/docs/grafana/latest/developers/http_api/alerting_notification_channels/)

## 9.xの場合

* [Create and manage alerts: 12 ways it's easier in Grafana Alerting](https://grafana.com/blog/2023/03/06/grafana-alerting-12-ways-we-made-creating-and-managing-alerts-easier-than-ever/#5-export-alert-rules-for-provisioning)
* [Alerting | Grafana documentation](https://grafana.com/docs/grafana/latest/alerting/)

アラートをSlackで通知するには以下を設定する必要がありそう

* Notification Template
* Contact Points
* Alert

こちらのAPIを使えばそれぞれ設定できる様子

* [Alerting Provisioning HTTP API | Grafana documentation](https://grafana.com/docs/grafana/latest/developers/http_api/alerting_provisioning/)

より詳しくはこちら [Grafana Alertを設定する](note/Grafana%20Alertを設定する.md)

## Provisioning

[Provision Grafana | Grafana documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/)

構築時にyamlで設定しておくとよいよ

helmの場合はこちらの `alerting` の項目

https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) を使っている場合、subchartとしてgrafanaが定義されているので、以下のように設定できる。

````yaml
grafana:
  alerting:
    rules.yaml:
      apiVersion: 1
      groups:
        - orgId: 1
    # ...
````

## ダッシュボードとアラートをexport/importするshell script

以上踏まえてこんな感じに作った

`import.sh`

````shell
BASE_URL=$1
# GrafanaのAPI KEY
TOKEN=$2

# フォルダを作成
curl -XPOST -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' -Ss -d '@folders.json' "$BASE_URL/api/folders"

# ダッシュボードを作成
curl -XPOST -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' -Ss -d "@dashboard.json" "$BASE_URL/api/dashboards/db"

# Alert Ruleを作成
for i in $(seq $(cat alert-rules.json | jq '. | length')); do
  rule=$(cat alert-rules.json | jq --argjson index $(($i-1)) '.[$index]')
  echo "$rule" | curl -XPOST -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' -H 'X-Disable-Provenance: none' -Ss -d @- "$BASE_URL/api/v1/provisioning/alert-rules"
done
````

`export.sh`

````shell
BASE_URL=$1
# GrafanaのAPI KEY
TOKEN=$2

# ダッシュボード
curl -XGET -H "Authorization: Bearer ${TOKEN}" -Ss "$BASE_URL/api/dashboards/uid/my-board" | jq 'del(.meta, .dashboard.id)' | jq '. |= .+ {"folderUid": "solr", "overwrite": true}' > dashboard.json

# Alert Rule
curl -XGET -H "Authorization: Bearer ${TOKEN}" -Ss "$BASE_URL/api/v1/provisioning/alert-rules" > alert-rules.json
````
