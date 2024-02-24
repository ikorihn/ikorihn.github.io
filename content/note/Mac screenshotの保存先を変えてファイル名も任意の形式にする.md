---
title: Mac screenshotの保存先を変えてファイル名も任意の形式にする
date: "2023-05-09T11:49:00+09:00"
tags:
  - '2023/05/09'
  - Mac
---

Macでスクリーンショットを撮ると、デフォルトではデスクトップに `スクリーンショット [日付] [時刻].png` といった名前で保存されます。

これはシステム設定に応じてファイル名が日本語になってしまうのと、スペースが入っていて扱いづらいので、なんとかしたいです。

## 方法1 defaultsでファイル名を変更する

[[Macのdefaultsコマンド]] をつかって、名前の規則を変更します

prefixを `screenshot` にする

```shell
defaults write com.apple.screencapture name "screenshot"
```

日付、時刻を含めないようにする

```shell
defaults write com.apple.screencapture include-date -bool false
```

ただこれだと、`screenshot.png` `screenshot 1.png` のように2枚目以降連番がつくようになるので、日付時刻はスペースが入らない形で含めるようにしたいです。
そこで次のようにしました

## 方法2 Automatorを使って作成されたファイルの名前を変更する

[[Automator]] の [Folder Action](https://macosxautomation.com/automator/folder-action/index.html) を使って、指定したフォルダに作成されたファイルを自動でリネームします。

デスクトップのままだと、デスクトップに作成したファイルすべてが影響を受けるので、スクリーンショットの保存先を指定します。

```shell
# 保存先は任意です
defaults write com.apple.screencapture location -string "~/Pictures/screenshot"
```

Automatorで次のようにして、screenshotディレクトリに作成されたファイルを `screenshot-yyyyMMddHHmmss.png` にします。

![[note/Pasted-image-20230509115147.png|]]

![[note/Pasted-image-20230509115129.png|]]

これでスクリーンショットを撮ると、自動でリネームされるようになります。
