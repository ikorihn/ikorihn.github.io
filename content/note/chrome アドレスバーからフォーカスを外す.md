---
title: chrome アドレスバーからフォーカスを外す
date: 2021-08-17T11:23:00+09:00
lastmod: 2021-08-17T11:24:08+09:00
---

<https://github.com/philc/vimium/issues/840#issuecomment-17948885>

Google ChromeのSearch Engineで空のJavaScriptを実行するキーワードを設定しておく

* Google Chromeの設定ページ→`Manage Search Engine`（`chrome://settings/searchEngines`）へ行く
* `Other Search Engine`から`Add`で新規作成、任意のタイトルとショートカットとなるキーワード（`unfocus`の頭文字でここでは`u`）とURLの代わりの`javascript::`を入力・保存

これでアドレスバーにフォーカスが当たっている状態で`u`→`Enter`を押下すると`javascript::`というスクリプトが実行される
