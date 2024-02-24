---
title: Node.js npm installを早くしたい
date: "2022-10-27T18:42:00+09:00"
tags:
  - 'Nodejs'
  - 'Docker'
lastmod: "2022-11-08T15:24:00+09:00"
---

#Nodejs #Docker

## 依存関係解決を早くしたい

`npm ci` を使う

[CI/CDでnpm ciする際は ~/.npm をキャッシュしよう | DevelopersIO](https://dev.classmethod.jp/articles/cicd-npm-ci-cache/)
[npm ciを使おう あるいはより速く - Qiita](https://qiita.com/mstssk/items/8759c71f328cab802670)

- `package-lock.json` のみを見て依存関係解決する(`npm install` は `package.json` も見る)
- `npm ci` では `node_modules` は実行の都度洗い替えされる

更に `npm ci --production` とすると `devDependency` のインストールが行われなくなる。
`--production` や `--only=production` はnpm v8ではdeprecatedで、 `--omit=dev` を使う。

## パッケージをキャッシュしてビルドを早くしたい

`npm ci` を使うと、デフォルトでは `~/.npm` にキャッシュが作られる。
CIサーバー上などで `~/.npm` にアクセスできない場合はcacheのpathを変更する。

- `--cache <path>` オプションをつける
- `npm config set cache <path>` でグローバルに設定する

[node.js - Is there a way to speedup npm ci using cache? - Stack Overflow](https://stackoverflow.com/questions/55230628/is-there-a-way-to-speedup-npm-ci-using-cache)
<https://docs.npmjs.com/cli/v8/commands/npm-cache>

キャッシュを使うには、 `--prefer-offline` をつける(キャッシュにない場合は取得される)
<https://docs.npmjs.com/cli/v8/using-npm/config#prefer-offline>

## 結論

こちらのコマンドでインストールすると次回以降もキャッシュが効くようになる

```shell
npm ci --omit=dev --prefer-offline --cache /path/to/npm_cache/
```
