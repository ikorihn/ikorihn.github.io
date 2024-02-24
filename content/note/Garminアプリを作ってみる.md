---
title: Garminアプリを作ってみる
date: "2023-01-07T17:06:00+09:00"
tags: 
    - '2023/01/07'
---

## 作るもの

[Apple Watchの「Tapticタイム」で現在時刻を振動で確認する方法 | Apple Watch Wave](https://www.ipodwave.com/applewatch/howto/taptic_time.html)
Tapticタイムみたいに、現在時刻を振動で知りたい

https://github.com/ikorihn/gtaptic

## 環境構築

vscodeで作ってみる
[Visual Studio CodeでGarmin Connect IQの開発 | Take4-blue](https://take4-blue.com/program/garmin/visual-studio-code%E3%81%A7garmin-connect-iq%E3%81%AE%E9%96%8B%E7%99%BA/)
https://developer.garmin.com/connect-iq/reference-guides/visual-studio-code-extension/
こちらに沿ってすすめる

Monkey Cという言語らしい

[Monkey C - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=garmin.monkey-c) をインストール

コマンドパレットから `Monkey C: Verify Installation` を選ぶと、ブラウザでConnect IQ SDK Managerインストール画面が開く

[Connect IQ Basics](https://developer.garmin.com/connect-iq/connect-iq-basics/getting-started/)

Connect IQ SDK Managerをダウンロードして実行
画面にそってセットアップを行う。
自動アップデートの有無などを聞かれる。一旦OFFにした。

SDK Managerが開くので、SDK一覧から Connect IQ 4.1.7 をインストール

![[note/Pasted-image-20230107171859.png|Pasted-image-20230107171859]]

Devices から対象にしたいデバイスもインストール

SDKやDeviceはMacの場合こちらにダウンロードされる。
`~/Library/Application Support/Garmin/ConnectIQ/`

もう一度vscodeに戻って、Verify Installation するとdeveloper keyを入力するボックスが出る。
まだ持っていないはずなので、generateの方を選ぶ。
作成先のディレクトリを聞かれるので、適当な場所を選択

JRE 1.8以上が入っていない場合、それもインストールする。

### プロジェクト作成

環境構築が済んだら、 `Monkey C: New Project` でプロジェクトを作成できる

Name (gtaptic) > Watch App > 最低バージョン 4.0.0 で作成
Watch Faceなどもここで選べる。

## コマンド

- `Edit Products` 対象デバイスを選択
- `Edit Application` アプリケーションを編集
- `Edit Permissions` 必要な権限を編集
- `Edit Language` 言語選択

## シミュレーターで実行する

https://developer.garmin.com/connect-iq/connect-iq-basics/your-first-app/

`~/Library/Application Support/Garmin/ConnectIQ/Sdks/{インストールしたSDK}/samples` にいくつかサンプルがあるのでそれを開く
`Run and Debug` > `Run` をするとアプリをビルドしてシミュレーターが開いて実行される


