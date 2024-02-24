---
title: vscode拡張
date: "2021-07-08T11:17:00+09:00"
tags:
  - 'vscode'
---

[[VisualStudio Code]] の拡張機能

## Settings Sync

<https://code.visualstudio.com/docs/editor/settings-sync>

公式の設定同期機能が[ver1.48](https://code.visualstudio.com/updates/v1_48#_settings-sync) でリリースされた

## [Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager)

プロジェクト一覧にアクセスしやすくなる
標準でもOpenやOpen Recentなどからフォルダを開けるが、これを使うとよく使うプロジェクトや、git管理のディレクトリをすぐ開くことができる

-   `Project Manager: Save Project` 現在のwindowをprojectに保存する
-   `Project Manager: Edit Project` プロジェクト一覧を手で編集する(`projects.json`)
    -  `"projectManager.projectsLocation": "~/vscode/"` setting.jsonで場所を変更することもできる
-   `Project Manager: List Projects to Open` プロジェクト一覧を表示して開く
    -   入力で絞り込むことができるので、開くときはこちらが便利
-   `Project Manager: List Projects to Open in New Window` プロジェクト一覧を表示して新しいウィンドウで開く
-   `Project Manager: Refresh Projects` Refresh the cached projects

### Git管理のディレクトリ一覧を表示

settings.jsonに、gitリポジトリ一覧のあるルートディレクトリを指定する
`"projectManager.git.baseFolders": "~/repos"` 
