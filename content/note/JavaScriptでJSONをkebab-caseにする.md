---
title: JavaScriptでJSONをkebab-caseにする
date: 2021-09-16T12:16:00+09:00
tags:
- JavaScript
lastmod: 2021-09-16T12:16:27+09:00
---

\#JavaScript

````javascript
export const stringifyRoutePoint = (point?: QueryRoutePoint) =>
  point != null
    ? JSON.stringify(point, (key: string, value: any) => {
        if (value && typeof value === 'object') {
          const replacement: { [key: string]: string } = {}
          for (const v in value) {
            if (Object.hasOwnProperty.call(value, v)) {
              const key = kebabize(v)
              console.log('kebabize---', key, value)
              replacement[key] = value[v]
            }
          }

          return replacement
        }
        return value
      })
    : undefined

const kebabize = (str: string) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter
    })
    .join('')
}

````
