---
title: Slackでチャンネル一覧の情報を調べよう
date: 2024-07-25T10:21:00+09:00
tags:
  - Slack
---

自分の所属しているワークスペースのチャンネル一覧(publicのみ)を取得する

```typescript
const SLACK_OAUTH_TOKEN = process.env.SLACK_OAUTH_TOKEN; // 'xoxb- で始まる'
const USER_ID = process.env.USER_ID;

async function main() {
  let nextCursor = "";
  for (let i = 0; i < 1000; i++) {
    console.log(nextCursor);

    let url = `https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel,private_channel&limit=100`;
    if (nextCursor !== "") {
      url += `&cursor=${nextCursor}`;
    }

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SLACK_OAUTH_TOKEN}`,
      },
    });
    const respBody = await resp.json();

    const channels = respBody.channels
      .filter((c) => c.creator === USER_ID)
      .map((c) => {
        return { id: c.id, name: c.name, creator: c.creator };
      });
    console.log(channels);
    nextCursor = respBody.response_metadata?.next_cursor;
    if (nextCursor == null || nextCursor === "") {
      break;
    }

    // avoid rate limit
    Bun.sleepSync(3000);
  }
}

await main();
```
