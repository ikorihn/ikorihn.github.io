---
title: Nuxt3 useAsyncDataでOpenAPIから生成した型を使用する
date: 2023-06-08T11:27:00+09:00
tags:
- 2023/06/08
- Nuxtjs
---

## Date型の変換でミリ秒をつけたくない

パラメータが `format: date-time` のとき `.toISOString()` でstringにしているのだが、ミリ秒は取りたくない。
なのでdate-timeなパラメータはstringで生成されてほしい。

こちらでカスタマイズができるようだった。

{{< card-link "https://openapi-generator.tech/docs/customization/" >}}

`--type-mappings=Date=string` をつけた。
