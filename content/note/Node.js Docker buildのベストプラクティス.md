---
title: Node.js Docker buildのベストプラクティス
date: "2022-10-27T18:42:00+09:00"
tags: 
---

#Nodejs #Docker 

[Node.jsのDockerfile作成のベストプラクティス](https://zenn.dev/kouchanne/articles/6485193823ecec5735d4)
[DockerでNode.jsを動かすときのベストプラクティス](https://blog.shinonome.io/nodejs-docker/)

- マルチステージビルド
- `npm ci --production` を使う
- [distroless/nodejs](https://github.com/GoogleContainerTools/distroless/blob/main/nodejs/README.md) を使う
- `tini` を使い、`npm` ではなく `node` コマンドで起動してSIGTERMのシグナルが伝播するようにする
- USERをroot以外にする
