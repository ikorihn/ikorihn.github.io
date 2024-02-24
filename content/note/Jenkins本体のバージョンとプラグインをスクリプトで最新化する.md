---
title: Jenkins本体のバージョンとプラグインをスクリプトで最新化する
date: "2023-01-27T13:03:00+09:00"
tags:
  - '2023/01/27'
  - 'Jenkins'
---

jenkinsの最新バージョンを取得するURL
<https://stackoverflow.com/questions/43857882/how-to-query-the-current-jenkins-lts-version-number>

- For stable (LTS) <https://updates.jenkins.io/stable/latestCore.txt>
- And for the latest <https://updates.jenkins.io/latestCore.txt>

[Simple groovy script to upgrade active plugins when new versions are available](https://gist.github.com/alecharp/d8329a744333530e18e5d810645c1238)
[jenkins safe auto update plugins](https://gist.github.com/taherbs/6d03b4d56ac4f1e7a119e64cf5d17f4c)

```groovy
def jenkins = Jenkins.get()
UpdateCenter uc = jenkins.getUpdateCenter()

// UpdateSitesのデータ更新
uc.sites.each { site ->
    site.updateDirectlyNow()
}

def plugins = jenkins.pluginManager.activePlugins.collect {
    // 新しいバージョン
    UpdateSite.Plugin updateSitePlugin = uc.getPlugin(it.shortName, it.versionNumber)
    return [
            name             : it.shortName,
            installed_version: it.version as String,
            available_version: updateSitePlugin.version as String,
    ]
}

println plugins.collect { "${it.name}:${it.available_version}" }.join(" ")
```
