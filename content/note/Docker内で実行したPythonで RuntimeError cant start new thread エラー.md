---
title: Docker内で実行したPythonで RuntimeError cant start new thread エラー
date: 2024-06-27T14:35:00+09:00
tags:
  - Python
---

## 環境
- [[Python]] 3.9
- [[Docker]] 19.x

## 問題

## 解決策

[multithreading - Python in docker – RuntimeError: can't start new thread - Stack Overflow](https://stackoverflow.com/questions/70087344/python-in-docker-runtimeerror-cant-start-new-thread)

Dockerを20.10.24以上にアップデートすることで解消するとのコメントがある。

または、pipはprogress barを表示するのにスレッドを使っているため、表示をオフにすることで解消する。

```python
RUN pip install --progress-bar off

# あるいはグローバル設定でOFF
RUN pip config --user set global.progress_bar off
```

## `sam build --use-container` が失敗する

[[SAM]] を使ってLambdaにデプロイするときに、 `sam build --use-container` としていたのだが、このときにprogressbarをOFFにする方法がわからなかった。
Dockerのバージョンも上げにくい環境だった。

そこで以下のようにして、依存関係のダウンロードのみローカルで実行してからビルドすることにした。(pythonのインストールが必要になってしまうのでuse-containerの恩恵が減る)

```
# あらかじめ依存関係をダウンロードしておいてrequirements.txtは削除することで、sam buildの処理中にはダウンロードされない
cat requirements.txt | cut -d ';' -f 1 | sed -e 's/ \+$//' > tmp && mv tmp requirements.txt
pip3 install -r requirements.txt -t .
rm requirements.txt

sam build --config-env dev
sam deploy --config-env dev
```

