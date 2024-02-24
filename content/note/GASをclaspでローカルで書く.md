---
title: GASをclaspでローカルで書く
date: "2021-06-06T15:27:00+09:00"
lastmod: '2021-06-06T16:12:34+09:00'
tags:
  - 'GAS'

---

#GAS

[[GAS]]をローカルで開発するために [clasp](https://github.com/google/clasp) を使う

## clasp

-   2018年1月から使えるようになったGoogle公式のCLIツール
-   できること
    -   プロジェクトの新規作成、クローン
    -   GASファイルのアップロード/ダウンロード
    -   バージョン一覧の取得
    -   新規バージョンを作成
    -   デプロイ
    -   デプロイ一覧の取得
    -   スクリプトエディタを開く
-   GASがローカル開発できる
-   TypeScriptでかける
-   コードラボが用意されているのでこちらで学べる

<https://codelabs.developers.google.com/codelabs/clasp/#0>

### インストール

[[NodebrewでNode.jsのバージョンを管理する]] でNodeを入れる

グローバルにインストールしても、ローカルにnpm initしてからインストールしてもよい。

```shell
$ npm i @google/clasp -g
$ clasp help
```

### Google Apps Script APIを有効化

<https://script.google.com/home/usersettings>

### ログイン

Web上のエディタにアップロードするにもダウンロードするにも認証が必要なので、以下コマンドでログインする

```shell
$ clasp login
🔑  Authorize clasp by visiting this url:
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%...
```

ブラウザが開き、アカウントの選択と、APIの承認画面が表示されるので、承認する

ログイン情報は、`$HOME/.clasprc.json` に保存されている

### 既存のプロジェクトを編集したい場合

git clone と同じような感覚でローカルにダウンロードできる

```shell
$ clasp clone ${scriptId}
```

scriptIdは、スクリプトエディタで開いたときの以下の部分

-   旧エディタ `https://script.google.com/d/<scriptId>/edit`
-   新エディタ `https://script.google.com/home/projects/<scriptId>/edit`

※2020年の年末ごろにエディタが新しくなり、URLも変わった

-   GASのプロジェクトがダウンロードされる
    -   .clasp.json
        -   プロジェクト設定ファイル
        -   scriptId (必須): <https://script.google.com/d/><SCRIPT_ID>/edit のSCRIPT_ID部分
        -   rootDir: プロジェクトを保存するディレクトリを指定
    -   appsscript.json
        -   マニフェストファイル
        -   GAS実行時の設定など
    -   作成済みのスクリプトファイル
        -   なお、.gsではなく.jsでダウンロードされる

### 新規作成の場合

```shell
$ clasp create --title <projectName> --rootDir <ソースファイルを置くディレクトリ>
```

プロジェクトタイプを聞かれる

-   standalone: スクリプト単体で作成される
-   docs,sheets,...: 選択したドキュメントと、それに紐づくスクリプトとして作成される

### リモートの修正をローカルに反映する

```shell
$ clasp pull
```

-   ブラウザ上で修正したものがローカルに反映される
-   強制的に上書きされるので注意が必要

### ローカルの修正をリモートに反映する

```shell
$ clasp push
```

-   rootDirで指定したすべてのファイルがpushされる
-   特にquestionもなく強制上書きになるので、Web上で編集している場合は注意する
-   Git関連のファイルなどは反映したくない

=> claspignore を作成

### claspignore

カレントディレクトリに `.claspignore` ファイルを作成して、clasp管理外にするファイルを記載すると、push,pullから管理外になる

記法はgitignoreと同様

### ディレクトリ構成

以下のようにディレクトリを分けることができる

```shell
./
├── appsscript.json
└── src
│   └── Code.js
└── test
    └── Code.js
```

-   これを `clasp push` すると、 `/` 区切りでファイルが登録される
-   pull してもディレクトリは保持される

### その他できること

#### プロジェクトを開く

ブラウザで開くには以下のコマンドを実行

```shell
$ clasp open
```

#### 関数を実行

```shell
$ clasp run [functionName]
```

#### ログを見る

```shell
clasp logs 
```

事前にProjectIDを設定しておく

スクリプトエディタから`リソース > Cloud Platform Project`を開いて、`project-id-xxxxxxxxxxxxxxxxxxx` をコピーして.clasp.jsonに貼り付ける

```json
    {
      "scriptId":"<SCRIPT_ID>",
      "projectId": "project-id-xxxxxxxxxxxxxxxxxxx"
    }
```

### バージョン管理

Gitのバージョン管理ではなくて、GASのバージョン管理

```shell
$ clasp version [バージョンの説明]
Created version x
```

するとスクリプトエディタ上でバージョンが作られているのを確認できる
コマンドで確認する場合は `clasp versions`

### Git管理

-   clasp でローカルにGASプロジェクトを作成できるようになったため、Gitで管理できる
-   gitignoreに、Node.gitignoreを書いておくとよい

他の人も git clone から開発できるようになる(スクリプトへのアクセス権限はもっている必要がある)

```shell
$ git clone [スクリプトのリポジトリ]
(ファイルに変更を加える)
$ clasp push
(Gitへもcommit, push する)
```

## CIとの連携

-   Jenkinsにclasp を設定しておけば、例えば以下のようなことが可能
    ローカルで開発
    ↓
    BitbucketにPush
    ↓
    Jenkinsで`git clone`
    ↓
    テスト、静的解析
    ↓
    `clasp push`

-   注意
    -   リモートかローカルか決めたほうでのみ開発する
    -   スクリプトエディタからであれば開発環境構築なしで作れるというメリットもあるので、どちらを取るかはそのときに合わせる

### 参考

[詳解！ Google Apps Script完全入門 ～Google Apps & G Suiteの最新プログラミングガイド～](https://www.amazon.co.jp/dp/B07BNB1Z9L)

[リファレンス](https://developers.google.com/apps-script/reference/)

[Google Apps Scriptの新しい3つの機能 その① Dashboard](https://qiita.com/soundTricker/items/59979d0bb065fdd8d536)
[Google Apps Scriptの新しい3つの機能 その② Apps Script API](https://qiita.com/soundTricker/items/13719acd2628ed87894c)
[Google Apps Scriptの新しい3つの機能 その③ CLI Tool Clasp](https://qiita.com/soundTricker/items/354a993e354016945e44)

<https://codelabs.developers.google.com/codelabs/clasp/#0>
[Command Line Interface using clasp](https://developers.google.com/apps-script/guides/clasp)
