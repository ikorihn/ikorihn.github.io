---
title: Grafana Alertを設定する
date: 2023-05-18T09:50:00+09:00
tags:
- 2023/05/18
- Grafana
---

[Grafana](note/Grafana.md) 9.xではアラートするのにContact points、Notification policies、Alert Ruleをそれぞれ設定する必要がある。

## Contact Points

E-mailやSlackなどの送信先と、送信メッセージのテンプレートを設定する。

### Notification Template

* 公式の説明 [Create notification templates | Grafana documentation](https://grafana.com/docs/grafana/latest/alerting/manage-notifications/template-notifications/create-notification-templates/)
* サンプルがいくつか紹介されているのでこれをコピペするのが便利 [Grafana Alerting: A guide to templating alert notifications](https://grafana.com/blog/2023/04/05/grafana-alerting-a-beginners-guide-to-templating-alert-notifications/)

テンプレートの作成時には以下のReferenceを参照するとよい。
利用できる変数が説明されている。

* [Customize notifications | Grafana documentation](https://grafana.com/docs/grafana/latest/alerting/manage-notifications/template-notifications/)
* [Reference | Grafana documentation](https://grafana.com/docs/grafana/latest/alerting/manage-notifications/template-notifications/reference/)

#### 例

* `Alert`: アラートの内容やダッシュボードURLなどを持ったデータ
* `Alert.Annotations`: summaryやdescriptionなどの情報をkey-valueで保持する

````go
{{ define "alerts.message" -}}
{{ if .Alerts.Firing -}}
{{ len .Alerts.Firing }} firing alert(s)
{{ template "alerts.summarize" .Alerts.Firing }}
{{- end }}
{{- if .Alerts.Resolved -}}
{{ len .Alerts.Resolved }} resolved alert(s)
{{ template "alerts.summarize" .Alerts.Resolved }}
{{- end }}
{{- end }}

{{ define "alerts.summarize" -}}
{{ range . -}}
- {{ index .Annotations "summary" }}
{{ end }}
{{ end }}
````

Alert Ruleで、Summary and annotations を設定できる項目があるので、Summaryに以下のようなメッセージを設定しておくと、次のような通知が飛ぶようになる。

Summary

````
The database server {{ index $labels "instance" }} has exceeded 75% of available disk space. Disk space used is {{ index $values "B" }}%, please resize the disk within the next 24 hours
````

````
1 firing alert(s)
- The database server db1 has exceeded 75% of available disk space. Disk space used is 76%, please resize the disk size within the next 24 hours

1 resolved alert(s)
- The web server web1 has been responding to 5% of HTTP requests with 5xx errors for the last 5 minutes
````

## Notification policies

[Manage notification policies | Grafana documentation](https://grafana.com/docs/grafana/latest/alerting/manage-notifications/create-notification-policy/)

通知をAlert ruleにつけたラベルなどでグルーピングして、通知先や間隔の設定をまとめて行える。
default policyを設定しておけば何もなければそれがつかわれる。

## Alerting Rule

通知する条件やメッセージを設定する。おそらく一番触る部分
