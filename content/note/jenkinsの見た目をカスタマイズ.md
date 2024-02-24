---
title: jenkinsの見た目をカスタマイズ
date: "2021-08-25T16:51:00+09:00"
lastmod: '2021-08-25T17:01:20+09:00'
tags:
  - 'Jenkins'
---

[[note/Jenkins]] のデフォルトの見た目は古臭いので、好きなテーマに変更する。
また、環境ごとの違いをひと目でわかりやすくすることで事故を防ぐ。

## jenkins-material-theme をダウンロード

<http://afonsof.com/jenkins-material-theme/>
から色とロゴを指定してテーマをダウンロードする。

## プラグインを設定

[Jenkinsの管理] -> [プラグインの管理] -> [利用可能] -> [Simple Theme Plugin](https://plugins.jenkins.io/simple-theme-plugin/) をインストール

ダウンロードしたスタイルシートのファイル（jenkins-material-theme.css）を Jenkins フォルダの userContent フォルダへ配置する

- Jenkinsを置いてあるサーバにSSHログイン
- /ドキュメントルート/userContent/jenkins-material-theme.css

Jenkinsの管理のシステムの設定でダウンロードしたテーマを指定する。

URL of theme CSS: `/userContent/jenkins-material-theme.css`

## material-theme を適用したときに、pipelineエディタでカーソル位置と実際に編集される位置がずれる

`:not(div.ace_editor)` に `font-family: Roboto, sans-serif!important` が設定されているため等幅フォントになっていない。

[Main Script -- Replay -- the cursor in the editor is out of phase · Issue #184 · afonsof/jenkins-material-theme](https://github.com/afonsof/jenkins-material-theme/issues/184)

等幅フォントを設定してあげればよい。
自分でカスタマイズできるのが利点

```css:jenkins-material-theme.css
#main-panel>pre *,
.ace_editor .ace_scroller .ace_content * {
  font-family: Roboto Mono, monospace !important;
}

div.ace_editor.ace-tomorrow,
div.ace_editor.ace-tomorrow * {
  font: 12px/normal Roboto Mono, monospace !important;
}
```

## 参考

[Jenkinsのテーマ(UI)を変えてみた | レコチョクのエンジニアブログ](https://techblog.recochoku.jp/2021)
