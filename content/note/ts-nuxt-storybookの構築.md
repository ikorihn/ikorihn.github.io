---
title: ts-nuxt-storybookの構築
date: "2021-01-07T12:57:00+09:00"
tags:
  - TypeScript
  - Vuejs
lastmod: '2021-05-30T18:45:29+09:00'

---

# ts nuxt storybookの構築

-   Nuxt.js 2.14.6
-   TypeScript 4.0.5
-   Storybook 6.1.10
-   @nuxtjs/tailwindcss: 3.1.0

## TypeScriptで書かれたVueコンポーネントを使う

```diff
module.exports = {
  webpackFinal: async (config) => {

+    config.module.rules.push({
+      test: /\.ts$/,
+      exclude: /node_modules/,
+      use: [
+        {
+          loader: 'ts-loader',
+          options: {
+            appendTsSuffixTo: [/\.vue$/],
+            transpileOnly: true,
+          },
+        },
+      ],
+    })

    return config
  },
}
```

## TailwindCSSを使う

.storybook/main.js

```diff
module.exports = {
  webpackFinal: async (config) => {

+    config.module.rules.push({
+      test: /\.css$/,
+      exclude: /node_modules/,
+      use: [
+        {
+          loader: 'postcss-loader',
+          options: {
+            ident: 'postcss',
+            plugins: [require('tailwindcss')('./tailwind.config.js')],
+          },
+        },
+      ],
+    })
+
+    config.module.rules.push({
+      test: /\.scss$/,
+      exclude: /node_modules/,
+      use: [
+        {
+          loader: 'postcss-loader',
+          options: {
+            ident: 'postcss',
+            plugins: [require('tailwindcss')('./tailwind.config.js')],
+          },
+        },
+        {
+          loader: 'sass-loader',
+        },
+      ],
+    })

    return config
  },
}
```

.storybook/preview.js

```diff
+ import './tailwind.css'
```

.storybook/tailwind.css

```diff
+ @import 'tailwindcss/base';
+ @import 'tailwindcss/components';
+ @import 'tailwindcss/utilities';
```

## 共通のCSSを読み込む

.storybook/preview.js

    + import '~/assets/style/common.css'

## Link

[[TypeScript]] [[Nuxt.js]] [[Vue.js]]
