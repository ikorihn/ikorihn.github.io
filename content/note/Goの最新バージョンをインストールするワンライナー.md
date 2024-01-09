---
title: Goの最新バージョンをインストールするワンライナー
date: 2023-12-18T10:40:00+09:00
tags:
- Go
---


````shell
sudo rm -rf /usr/local/go && curl -L https://go.dev/dl/$(curl 'https://go.dev/dl/?mode=json' | jq -r '.[0].files[] | select(.os == "darwin" and .arch == "arm64" and .kind == "archive") | .filename') | sudo tar -zx -C /usr/local/
````

## [Go](note/Go.md) のバージョン一覧は https://go.dev/dl/?mode=json から取得できる

以下のような形式で取得できるので、os、arch、kindを指定してfilenameを取得する

M1 Macなので、 `curl 'https://go.dev/dl/?mode=json' | jq -r '.[0].files[] | select(.os == "darwin" and .arch == "arm64" and .kind == "archive") | .filename'`

````json
[
 {
  "version": "go1.21.5",
  "stable": true,
  "files": [
   {
    "filename": "go1.21.5.src.tar.gz",
    "os": "",
    "arch": "",
    "version": "go1.21.5",
    "sha256": "285cbbdf4b6e6e62ed58f370f3f6d8c30825d6e56c5853c66d3c23bcdb09db19",
    "size": 26986890,
    "kind": "source"
   },
   {
    "filename": "go1.21.5.aix-ppc64.tar.gz",
    "os": "aix",
    "arch": "ppc64",
    "version": "go1.21.5",
    "sha256": "4402b0689f14895636ea7b61d8d037d90b64f1e3a108f3dbc68becfa7b2e4034",
    "size": 64915238,
    "kind": "archive"
   },
   {
    "filename": "go1.21.5.darwin-amd64.tar.gz",
    "os": "darwin",
    "arch": "amd64",
    "version": "go1.21.5",
    "sha256": "a2e1d5743e896e5fe1e7d96479c0a769254aed18cf216cf8f4c3a2300a9b3923",
    "size": 67299408,
    "kind": "archive"
   },
   {
    "filename": "go1.21.5.darwin-amd64.pkg",
    "os": "darwin",
    "arch": "amd64",
    "version": "go1.21.5",
    "sha256": "4fddd8f73c6151c96556cbb7bb6b473396f52385e874503e9204264aa39aa422",
    "size": 68279588,
    "kind": "installer"
   },
...
````

## `/usr/local/go` を削除して作成しなおす

````shell
sudo rm -rf /usr/local/go 
curl -L https://go.dev/dl/$(curl 'https://go.dev/dl/?mode=json' | jq -r '.[0].files[] | select(.os == "darwin" and .arch == "arm64" and .kind == "archive") | .filename') | sudo tar -zx -C /usr/local/
````
