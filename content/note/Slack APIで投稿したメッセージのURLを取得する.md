---
title: Slack APIで投稿したメッセージのURLを取得する
date: "2023-03-30T12:56:00+09:00"
tags:
  - '2023/03/30'
  - 'Slack'
  - 'GAS'
lastmod: "2023-03-30T12:56:00+09:00"
---

[slackのAPI chat.postMessage で投稿したメッセージのURLを取得するGAS - シンプルに暮らしたい情シスのブログ](https://simple-josys.hatenablog.com/entry/2022/01/18/231004#chatgetPermalink%E3%81%AEresponse%E3%81%AE%E4%B8%AD%E8%BA%AB)

https://api.slack.com/methods/chat.postMessage でpostしたメッセージのURLが知りたかった。
レスポンスにメッセージのURLが入っていればいいのだがそうではないので、 https://api.slack.com/methods/chat.getPermalink で取得する

リクエストに channel ID、メッセージのタイムスタンプが必要となる。
タイムスタンプは、postMessageのレスポンスに含まれる(`ts`)

```js
// SLACK_TOKENは、プロジェクトの設定 > スクリプトプロパティ で変更可能
const token = PropertiesService.getScriptProperties().getProperty('SLACK_TOKEN');

function postMessage(channelId, message) {
  const payload = {
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
  }; 
  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(
      'https://slack.com/api/chat.postMessage',
      options
    );
    return JSON.parse(response);
  } catch (e) {
    Logger.log(e);
    return false;
  }

}

function getMessageUrl(channelId, messageTimestamp) {
  const payload = {
    channel: channelId,
    message_ts: messageTimestamp,
  }; 
  const options = {
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true,
    payload: payload,
  };

  try {
    const response = UrlFetchApp.fetch(
      'https://slack.com/api/chat.getPermalink',
      options
    );
    return JSON.parse(response);
  } catch (e) {
    Logger.log(e);
    return false;
  }

}

function main() {
  const channelId = 'XXXXX';
  const postRes = postMessage(channelId, 'いえー');
  if (!postRes.ok) {
    return;
  }
  const messageRes = getMessageUrl(channelId, postRes.ts);
  if (messageRes.ok) {
    const messageUrl = messageRes.permalink;
    console.log(messageUrl);
  }
}
```
