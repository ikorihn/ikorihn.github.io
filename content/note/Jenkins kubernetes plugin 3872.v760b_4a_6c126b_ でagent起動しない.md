---
title: Jenkins kubernetes plugin 3872.v760b_4a_6c126b_ でagent起動しない
date: 2023-02-21T11:21:00+09:00
tags:
- 2023/02/21
- Jenkins
lastmod: 2023-02-21T11:21:00+09:00
---

エラーログ

````
2023-02-21 01:06:57.665+0000 [id=81]	WARNING	o.c.j.p.k.KubernetesLauncher#launch: Error in provisioning; agent=KubernetesSlave name: jenkins-agent-x86-64-kjhkr, template=PodTemplate{id='afef69c1-5cc4-48a8-a070-fd6a6fd4f6d1', name='jenkins-agent-x86_64', namespace='staging-jenkins', runAsUser=0, runAsGroup=0, slaveConnectTimeout=600, idleMinutes=30, label='jenkins-agent-x86_64', serviceAccount='jenkins', nodeSelector='ap-type=cicd-jenkins-slave-kp-staging,arch=amd64', nodeUsageMode=NORMAL, podRetention='Never', annotations=[PodAnnotation{key='cluster-autoscaler.kubernetes.io/safe-to-evict', value='false'}]}
io.fabric8.kubernetes.client.KubernetesClientException: name not specified for an operation requiring one.
	at io.fabric8.kubernetes.client.dsl.internal.BaseOperation.requireFromServer(BaseOperation.java:182)
	at io.fabric8.kubernetes.client.dsl.internal.BaseOperation.get(BaseOperation.java:142)
	at io.fabric8.kubernetes.client.dsl.internal.BaseOperation.get(BaseOperation.java:93)
	at org.csanchez.jenkins.plugins.kubernetes.PodTemplateUtils.parseFromYaml(PodTemplateUtils.java:611)
Caused: java.lang.RuntimeException: Failed to parse yaml: "apiVersion: v1
````

`kubernetes-client-api:6.4.1-208.vfe09a_9362c2c` にバージョンが上がっていた
`kubernetes:3872.v760b_4a_6c126b_` があたっているバージョン

1. `kubernetes:3845.va_9823979a_744`  に下げた -> 効果なし
1. `overwritePlugins: true` に変更 -> 効果なし

````shell
echo "remove all plugins from shared volume"
# remove all plugins from shared volume
rm -rf /var/jenkins_home/plugins/*
````

3. `kubernetes-client-api:6.3.1-206.v76d3b_6b_14db_b` を指定した -> 起動するようになった
3. `overwritePlugins: false` の状態で `kubernetes:3845.va_9823979a_744` を指定した -> `kubernetes-client-api:6.4.1-208.vfe09a_9362c2c` に上がってしまった
   1. <https://github.com/jenkinsci/kubernetes-plugin/blob/67c727ed5b645f1e740ca9d7236aeda20d8362a9/pom.xml#L59> で指定されているので無理なのか
3. `kubernetes:3883.v4d70a_a_a_df034` を指定 -> 

issue 上がっていた
<https://issues.jenkins.io/browse/JENKINS-70639>
<https://issues.jenkins.io/browse/JENKINS-70637>

https://issues.jenkins.io/browse/JENKINS-70637?focusedCommentId=435317&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-435317
コメントで「なぜこんなメジャーなプラグインがテストもされずにリリースされているのか」「プラグインのいかれた依存関係管理にはうんざりだし、アップデートしたところで放置されているプラグインも多くて常時大量の脆弱性が出る」 …プラグイン管理に関しては本当そのとおりでなるべく使わないほうがいいんじゃないかとさえ思える
