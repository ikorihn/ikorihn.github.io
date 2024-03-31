---
title: Jenkins スクリプトコンソールでpluginやジョブを一覧で出力する
date: "2022-07-20T15:22:00+09:00"
tags:
  - 'Jenkins'
---
 
## plugin一覧を出力する

```groovy
// インストールされているプラグイン一覧を取得する
def pluginList = new ArrayList(Jenkins.instance.pluginManager.plugins)
pluginList.sort { it.getShortName() }.each{
  plugin -> 
    println ("${plugin.getShortName()}:${plugin.getVersion()}")
}

// アップデート一覧を出力する
UpdateCenter uc = Jenkins.get().updateCenter
// UpdateSitesのデータ更新
uc.sites.each { site ->
    site.updateDirectlyNow()
}

def plugins = Jenkins.get().pluginManager.plugins
plugins.toSorted { l,r -> l.shortName < r.shortName ? -1 : 1 }.collect{ plugin -> 
  UpdateSite.Plugin updateSitePlugin = uc.getPlugin(plugin.shortName, plugin.versionNumber)

  if (plugin.hasUpdate()) {
    return """-- ${plugin.shortName}:${plugin.version}
+- ${plugin.shortName}:${updateSitePlugin.version}"""
  } else {
        return """ - ${plugin.shortName}:${plugin.version}"""
  }
  
}.each{
  p -> println(p)
}

println ""
```

```groovy
def plugins = Jenkins.get().pluginManager.plugins
plugins.each {
    println "${it.shortName} (${it.version}) => ${it.dependencies}"
}

// graphvizを使ってgraphで表示する
def plugins = Jenkins.get().pluginManager.plugins
println "digraph test {"
plugins.each {
    def plugin = it.getShortName()
    println "\"${plugin}\";"
    def deps =  it.getDependencies()
    deps.each {
      def s = it.shortName
      println "\"${plugin}\" -> \"${s}\";"
    }
} 
println "}"

```
