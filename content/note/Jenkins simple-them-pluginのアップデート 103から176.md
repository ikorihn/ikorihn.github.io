---
title: Jenkins simple-them-pluginのアップデート 103から176
date: 2024-01-10T15:29:00+09:00
tags:
  - Jenkins
lastmod: '2024-01-10T15:29:41+09:00'
---

[[Jenkins]] の [Simple Theme plugin](https://plugins.jenkins.io/simple-theme-plugin/)  を久々にアップデートしたら、[[Jenkins Configuration as Code|CasC]] のロードでエラーになったため設定を変更する

## エラーログ

```
2024-01-10 06:01:40.779+0000 [id=17]	WARNING	o.e.j.s.h.ContextHandler$Context#log: Error while serving http://localhost:8080/reload-configuration-as-code/
io.jenkins.plugins.casc.UnknownAttributesException: unclassified: Invalid configuration elements for type: class jenkins.model.GlobalConfigurationCategory$Unclassified : simple-theme-plugin.
Available attributes : administrativeMonitorsConfiguration, ansiColorBuildWrapper, artifactManager, bitbucketEndpointConfiguration, buildDiscarders, buildUser, buildUserVars, builtInNode, casCGlobalConfig, defaultDisplayUrlProvider, defaultFolderConfiguration, defaultView, envVarsFilter, fingerprints, gitHubConfiguration, gitHubPluginConfig, gitParameter, globalDefaultFlowDurabilityLevel, globalLibraries, jobConfigHistory, junitTestResultStorage, location, mailer, metricsAccessKey, myView, nodeProperties, plugin, pollSCM, projectNamingStrategy, prometheusConfiguration, quietPeriod, rebuildDescriptor, resourceRoot, scmGit, scmRetryCount, shell, slackNotifier, timestamper, usageStatistics, viewsTabBar
```

## 元の設定値

```yaml
unclassified:
  simple-theme-plugin:
    elements:
      - cssText:
          text: |-
            .page-header {
                background-color: #777;
            }
```

## アップデート後

```yaml
appearance:
  simpleTheme:
    elements:
      - cssText:
          text: |-
            .page-header {
                background-color: #777;
            }
```

## 経緯

[Move configuration to appearance page by timja · Pull Request #156 · jenkinsci/simple-theme-plugin](https://github.com/jenkinsci/simple-theme-plugin/pull/156)

[[Jenkins]] にAppearanceの設定ページができたので、そちらのセクションに移しましょうってことになったみたい。

でこのコミットで修正された
https://github.com/jenkinsci/simple-theme-plugin/commit/14c2dd6a672c64af61395e5dcc8159c1d343f430

[172.v4b_8766c70078](https://github.com/jenkinsci/simple-theme-plugin/releases/tag/172.v4b_8766c70078) からこの挙動になっている。
