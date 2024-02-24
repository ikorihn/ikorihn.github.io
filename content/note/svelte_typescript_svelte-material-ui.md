---
title: svelte_typescript_svelte-material-ui
date: "2021-03-07T16:28:00+09:00"
lastmod: '2021-05-30T18:56:56+09:00'
tags:
  - 'TypeScript'
  - 'Svelte'
---

[[Svelte]] 

# svelte_typescript_svelte-material-ui

## svelte-material-ui を導入する

参考
<https://github.com/hperrin/svelte-material-ui>
<https://github.com/hperrin/smui-example-rollup/>

### インストール

```sh
yarn add -D svelte-material-ui
```

rollupでPostCSSを使うためのプラグインを導入

PostCSS 8 を使用するよう警告が出たため別でインストール
<https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users>

```sh
yarn add -D rollup-plugin-postcss
yarn add -D postcss
```

sassをインストール

```sh
yarn add -D node-sass sass
```

### rollup.config

rollup.config.js

    import postcss from 'rollup-plugin-postcss'

    export default {

      plugins: [
        postcss({
          extract: true,
          minimize: true,
          use: [
            [
              'sass',
              {
                includePaths: ['./theme', './node_modules'],
              },
            ],
          ],
        }),
      ]

    }

### themeファイルを作成

空ファイルでOK

```sh
touch theme/_smui-theme.scss
```

### フォント、アイコンを使用できるようにする

public/index.html

    <head>
     
       <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
       <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700" />
       <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono" />
    </head>
