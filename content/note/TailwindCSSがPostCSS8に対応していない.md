---
title: TailwindCSSがPostCSS8に対応していない
date: "2021-05-03T10:38:00+09:00"
tags: ['TailwindCSS']
---

<https://tailwindcss.com/docs/installation#post-css-7-compatibility-build>

## PostCSS 7 compatibility build

Tailwind CSS v2.0はPostCSS 8に依存する
エラーが出る

```shell
Error: PostCSS plugin tailwindcss requires PostCSS 8.
```

再インストールしてPostCSS 7互換バージョンをいれる

```shell
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

他のライブラリも含めPostCSS 8にあげられるようになったら、Tailwindを `latest` タグで再インストールする

```shell
npm uninstall tailwindcss
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```
