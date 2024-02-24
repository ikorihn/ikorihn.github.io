---
title: JSDoc VSCodeで型チェックをする
date: "2023-04-05T15:56:00+09:00"
tags:
  - '2023/04/05'
  - 'JavaScript'
  - 'TypeScript'
lastmod: "2023-04-05T15:56:00+09:00"
---

TypeScriptを使おうとするとビルドの手間がかかるので、小さいスクリプトで手軽に型チェックだけしたいときにJSDocで簡易的に型をつけたい。

1行目に `@ts-check` を書くのが重要

```javascript
// @ts-check
```

`@typedef` などを書くことで型チェックが行われてハッピーになれる

```javascript
/**
 * @typedef {Object} Payload
 * @property {string} channel - channelId
 * @property {Block[]} blocks - block
 */

/**
 * @typedef {Object} Block
 * @property {('section' | 'mrkdwn')} type - block type
 * @property {(Block | string)} text - inner block or text
 */

/**
 * @param {string} channelId - Slack channel ID
 * @param {string} message - message
 * @returns {Payload}
 */
function slackPayload(channelId, message) {
  // payloadを作成する処理...
  return {
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
    ],
  }
}

function send() {
  const payload = slackPayload('Cxxxxxx', 'hello');
  // payloadを送信する処理....
}
```
