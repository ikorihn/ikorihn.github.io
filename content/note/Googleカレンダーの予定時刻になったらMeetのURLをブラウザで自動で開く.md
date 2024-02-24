---
title: Googleカレンダーの予定時刻になったらMeetのURLをブラウザで自動で開く
date: "2021-08-31T20:27:00+09:00"
lastmod: '2021-08-31T20:27:36+09:00'
tags:
  - 'GAS'

---

#GAS

Google Meetでミーティングするときに、時間をすぎてしまうことがある。
時間になったらMeetの画面を強制的に開いてくれれば、遅れなくなるはず。

やり方はいろいろあると思う
Chrome拡張、Calendar API

今回は諸般の事情でCalendar APIを直接使えなかったため、以下の方針にした

## 方針

- [[Google Apps Script]] でカレンダーから予定を取得
- [[Google Apps Script]] をWebアプリとして公開して、JSONで取得できるようにする
- 時間を指定して `at` コマンドでmacの `open <MeetのURL>` をセットして、ブラウザを開くようにする

もっといいやり方ある気はするが、とりあえずこれでやりたいことは出来た

## GASを作成する

GASでWebアプリを作成する

### Calendar APIを有効化

[[Google Apps Script]] 組み込みの `CalendarApp` では情報が少なくMeetのURLがとれないため、[Calendar API](https://developers.google.com/apps-script/advanced/calendar) を使用する

GASのエディタ > サービス > Calendar を有効化

### dayjs を使う

日付をうまく扱うためにMoment.jsは開発が止まっているので、dayjsを使えるようにする。

ライブラリを追加 > dayjs のスクリプトIDを入力

スクリプトID: `1ShsRhHc8tgPy5wGOzUvgEhOedJUQD53m-gd8lG2MOgs-dXC_aCZn9lFB`

#### ちなみに

ライブラリのスクリプトIDを検索する方法がわからない…
仕方なく個人ブログやQiitaから情報を得たけど、公式情報じゃないのであまり良くない気がする
https://gas.excelspeedup.com/dayjs/

### 実装する

Webアプリとして使えるようにするため、`doGet` を実装する

```javascript:code.gs
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify(getSchedule()));
}

function getSchedule() {
  const now = new Date();
  const begin = dayjs.dayjs(now);
  const end = dayjs.dayjs(now).endOf('day');
    
  // デフォルトカレンダーのID
  const calendarId = CalendarApp.getDefaultCalendar().getId();

  // Calendar APIで本日の予定を取得する
  const events = Calendar.Events.list(calendarId, {
    timeMin: begin.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  const todayEvent = events.items.map(event => {
    let start;
    if (event.start.date) {
      // All-day event.
      start = new Date(event.start.date);
    } else {
      start = new Date(event.start.dateTime);
    }

    // atコマンドで使いやすい時間形式にフォーマット
    return {
      title: event.summary,
      start: dayjs.dayjs(start).subtract(1, 'minute').format("YYYYMMDDHHmm"),
      meetUrl: event.hangoutLink,
    }
  })

  console.log(todayEvent)

  return todayEvent;
}
```

### Webアプリとして公開

デプロイ > 新しいデプロイ > 説明を入力してデプロイ > WebアプリのURLを取得

## shellで予定一覧を取得して、atコマンドで設定

atコマンドが使えない場合は設定する。
参考: [[macでatコマンドを使う]] 

```shell
curl -H "Authorization: Bearer $TOKEN" -L "<GASのWebアプリURL>" | jq -r '.[] | .title + "," + .start + "," + .meetUrl' | awk -F ',' '{ print system("echo open " $3 " | at -t " $2 ) }'
```


