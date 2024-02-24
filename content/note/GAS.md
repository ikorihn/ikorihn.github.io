---
title: GAS
date: "2021-06-06T15:54:00+09:00"
tags:
  - 'GAS'
---

## Google Apps Script とは？

-   <https://developers.google.com/apps-script/overview>
-   Google社が提供するプログラミング言語
-   JavaScriptベースのスクリプト言語
    -   基本構文はJavaScriptと同じ

## Google Apps Script とは？

-   Googleの各サービスと連携して、閲覧編集できる
    -   Gmail
    -   Googleカレンダー
    -   Googleスプレッドシート
    -   Googleドキュメント
    -   Googleフォーム
-   インストール不要でブラウザ上で編集できる
    -   サーバレス
    -   クラウド上で実行される
-   更新情報
    -   <https://developers.google.com/apps-script/releases/>

## GASでできること

-   時間指定やイベントをトリガーにしてスクリプトを実行できる
-   カスタムメニューやダイアログなどをDocs,Sheets,Formsに追加できる
-   独自関数をSheetsに追加する
-   Webアプリケーションを公開

## 利用できる機能

-   Googleのアプリケーションやデータを操作したり、外部と連携する機能が提供されている
-   G Suite Service
    -   Googleが提供する基本的なサービスの操作
-   Script Service
    -   ユーティリティサービス
    -   Base, Utilities, URLFetch, Properties など
-   Advanced Google Service
    -   拡張サービス
    -   BigQuery, Analytics

## Good and Bad

### Good

-   環境構築不要
    -   ローカル開発環境構築は後述
-   アカウントとブラウザがあれば編集、実行ができる
-   サーバレス
-   無料

### Bad

-   スクリプトエディタの使い勝手が微妙
-   Gitでのバージョン管理ができない

-> 2018年のリリースで対応された(後述)

-   イントラにアクセスできない
    -   Jenkinsを直接実行できない
-   実行に回数制限がある
    -   ちょっとした運用ツールにはいいが外部向きには難しい

## 使ってみる

-   プロジェクトを開くには2通りの方法がある
    -   スプレッドシート、フォームなどを開いて[ツール→スクリプトエディタ]をクリックする
        -   サービスに紐付いたスクリプトが作成される
    -   [ダッシュボード](https://script.google.com/home)やドライブから直接新規作成する
-   function の中に処理を書く
    -   `ctrl + space` で補完される
-   関数を選択して実行、デバッグ
    -   承認が必要
        -   使用するサービスに応じて権限を許可する必要がある
        -   初回はGASの実行許可のダイアログが出るかもしれない
            -   TODO: 図
                <https://www.virment.com/step-allow-google-apps-script/>
        -   アクセス権限の情報は、ユーザの[アカウント情報]->[ログインとセキュリティ]->[接続済みのアプリとサイト]->[アカウントに接続されているアプリ]で確認できる

## ログ

-   `Logger.log` を関数内に書く
    -   値をそのまま表示する、フォーマットを指定する方法ができる
    -   Logger.log(object)
    -   Logger.log(format, string)
-   実行後 [表示]->[ログ] で開くまたは `[cmd] + [Enter]`
-   [表示] -> [実行トランスクリプト] で各関数の呼び出し順が表示される

## デバッグ

-   ブレークポイントを設置
-   虫マークでデバッグ実行
-   IDEと同じような使い方でステップ実行や、オブジェクトの中身表示などができる
