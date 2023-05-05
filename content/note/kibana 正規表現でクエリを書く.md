---
title: kibana 正規表現でクエリを書く
date: 2022-10-13T15:16:00+09:00
tags: null
---

KibanaはElasticsearchの記法でクエリを書くので、こちらのドキュメントを参照する

[Regexp query | Elasticsearch Guide \[8.4\] | Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html)

````json
{
  "query": {
    "regexp": {
      "user.id": {
        "value": "k.*y",
        "flags": "ALL",
        "case_insensitive": true,
        "max_determinized_states": 10000,
        "rewrite": "constant_score"
      }
    }
  }
}
````

正規表現で使えるsyntaxについてはこちら

[Regular expression syntax | Elasticsearch Guide \[8.4\] | Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/current/regexp-syntax.html)

### 否定先読み(negative lookahead)

「~を含まない」で検索したいとき役に立つ

`flags` を `COMPLEMENT` か `ALL` にすると有効になる

* `a~bc` => a(b以外)c にマッチする (abcにはマッチしない、aacやa1cにはマッチする)
* `~(.*(foo|bar).*)` => foo,barを含まない文字列にマッチする

https://stackoverflow.com/questions/38645755/negative-lookahead-regex-on-elasticsearch

### 積集合(INTERSECTION)

`&` が AND operator として使える

* `aaa.+&.+bbb` => 'aaabbb' にマッチする
* `.*night.*&~(.*-(fox|wolf).*)` => (night を含む) かつ (-fox または -wolf を含まない)
