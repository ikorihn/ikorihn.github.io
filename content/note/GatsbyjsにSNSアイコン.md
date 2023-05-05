---
title: GatsbyjsにSNSアイコン
date: 2021-05-02T22:19:00+09:00
tags:
- Gatsbyjs
---

## FontAwesomeをインストール

https://fontawesome.com/how-to-use/on-the-web/using-with/react

````bash
yarn add @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons
````

## コンポーネントを利用する

````
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithubSquare,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons'

// ...

      <a
        href={`https://github.com/${social.github}`}
        style={{ boxShadow: `none` }}
      >
        <FontAwesomeIcon
          color="#aeaeae"
          icon={faGithubSquare}
          style={{
            width: `32px`,
            height: `32px`,
            marginRight: `4px`,
          }}
        />
      </a>
      <a
        href={`https://twitter.com/${social.twitter}`}
        style={{ boxShadow: `none` }}
      >
        <FontAwesomeIcon
          color="#3eaded"
          icon={faTwitterSquare}
          style={{
            width: `32px`,
            height: `32px`,
            marginRight: `4px`,
          }}
        />
      </a>
````
