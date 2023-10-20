---
title: Vue-Storybook-Tailwind-Sassのセットアップ
date: 2021-05-30T18:55:00+09:00
tags:
- Vuejs
- css
- TailwindCSS
---

# Vue-Storybook-Tailwind-Sass

~/.storybook/main.js

````javascript
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true,
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.(css)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss')('./tailwind.config.js')],
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.(scss)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss')('./tailwind.config.js')],
          },
        },
        {
          loader: 'sass-loader',
        },
      ],
    })
	
	
    if (config.resolve.extensions != null) {
      config.resolve.extensions.push('.ts')
    }

    if (config.resolve.alias != null) {
      const rootPath = path.resolve(__dirname, '..')
      config.resolve.alias['@'] = rootPath
      config.resolve.alias['~'] = rootPath
    }

    return config
  },
}

````

~/.storybook/preview.js

````javascript
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

import './tailwind.css'
import '~/assets/style/common.css'
````

~/.storybook/tailwind.css

````css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
````
