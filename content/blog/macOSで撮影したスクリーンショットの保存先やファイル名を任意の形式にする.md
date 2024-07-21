---
title: macOSで撮影したスクリーンショットの保存先やファイル名を任意の形式にする
date: 2023-05-09T11:49:00+09:00
tags:
  - Mac
---

Macでスクリーンショットを撮ると、デフォルトではデスクトップに `スクリーンショット [日付] [時刻].png` といった名前で保存されます。

システムの言語設定にもよりますが、ファイル名が日本語になってしまうのと、スペースが入っていて扱いづらいので、任意の形式に変更したいと思います。

## 方法1 defaultsでファイル名のフォーマットを変更する

[[Macのdefaultsコマンド]] をつかって、名前のフォーマットを変更します

prefixを `screenshot` にする

```shell
defaults write com.apple.screencapture name "screenshot"
```

日付、時刻を含めないようにする

```shell
defaults write com.apple.screencapture include-date -bool false
```

ただこれだと、`screenshot.png` `screenshot 1.png` のように2枚目以降はスペース+連番となってしまいます。
日付時刻をスペースが入らない形で含めるようにしたいです。
そこで次の方法を採りました。

## 方法2 Automatorを使って作成されたファイルの名前を変更する

[[Automator]] の [Folder Action](https://macosxautomation.com/automator/folder-action/index.html) を使って、指定したフォルダに作成されたファイルを自動でリネームします。

デスクトップのままだと、デスクトップに作成したファイルすべてが影響を受けるので、スクリーンショットの保存先を指定します。

```shell
# 保存先は任意です
defaults write com.apple.screencapture location -string "~/Pictures/screenshot"
```

Automatorで次のように設定すると、screenshotディレクトリに作成されたファイルが `screenshot-yyyyMMddHHmmss` にリネームされるようになります。

Folder Action を作成

![[note/Pasted-image-20230509115147.png|]]

- basenameを `screenshot` に変更
- (日付と時刻を一回で付加できないので) `yyyyMMdd` を付加
- `HHmmss` を付加

![[note/Pasted-image-20230509115129.png|]]

これでスクリーンショットを撮ると、まず `~/Pictures/screenshot` にファイルが作成されたあと、少し時間差で `screenshot-yyyyMMddHHmmss.png` にリネームされるようになりました。
