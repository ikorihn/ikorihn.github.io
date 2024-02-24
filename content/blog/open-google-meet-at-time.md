---
title: "Googleカレンダーの予定時刻になったらMeetを自動で開くようにする"
date: "2021-09-24T19:00:00+09:00"
updated-date: "2021-09-24T19:00:00+09:00"
description: "Googleカレンダーの予定時刻になったらMeetを自動で開くようにする"
tags: ["GAS", "shell"]
---

```toc
# This code block gets replaced with the TOC
```

## モチベーション

オンラインミーティングをGoogle Meetでやっているのですが、気づいたら開始時間を過ぎていることがあります(本当によくない)
通知が来たときに開始までに少し時間があるので別な作業をしてしまうパターンが多いです。

時間になったらMeetの画面を自動で開いて、強制的に作業を中断すればそんなことがなくなる気がします。

## 方針

Googleカレンダーから予定を取得して、時間になったらそのMeetのURLをブラウザで開くようにしたいと思います。

やり方はいろいろあると思います。
Chrome拡張でカレンダーにアクセスする、Calendar APIでスケジュール一覧を取得する、…

今回は諸般の事情でCalendar APIを直接使えなかったため、以下の方針にしました。
OSはMacです。

- Google Apps Script(GAS) でカレンダーから一日のスケジュールをJSONで取得する
- このGASをWebアプリとして公開して、HTTP GETで取得できるようにする
- スケジュールの時刻に `at` コマンドをセットして、`open <MeetのURL>` を実行する

ターミナルで `at` をセットするのは今のところ手で朝に実行しています。

もっといいやり方がある気はしますが、とりあえずこれでやりたいことは出来ました。
以下、各手順となります。

## スケジュール取得GASを作成する

<https://script.google.com/home> から新しいスクリプトを作成する

### GASのCalendar APIを有効化

標準の [CalendarApp](https://developers.google.com/apps-script/reference/calendar) では取れる情報が少なくMeetのURLがとれないため、[Calendar API](https://developers.google.com/apps-script/advanced/calendar) を使用する

GASのエディタ > サービス > Calendar を有効化

### dayjs を使えるようにする

標準の [Utilities.formatDate](https://developers.google.com/apps-script/reference/utilities/utilities) でも日付フォーマットはできるが、もう少し日付をうまく扱うためにライブラリを入れる。
Moment.jsは開発が止まっているので、dayjsを使う。

GASのエディタ > ライブラリを追加 > dayjs のスクリプトID `1ShsRhHc8tgPy5wGOzUvgEhOedJUQD53m-gd8lG2MOgs-dXC_aCZn9lFB` を入力

#### 余談

ライブラリのスクリプトIDを検索する方法がわからない…
仕方なく個人ブログやQiitaから情報を得たけど、公式情報じゃないので気持ち悪い

スクリプトIDのエディタのURLを開くと、たしかにdayjsのコードのよう
<https://script.google.com/home/projects/1ShsRhHc8tgPy5wGOzUvgEhOedJUQD53m-gd8lG2MOgs-dXC_aCZn9lFB/edit>

### カレンダーから予定を取得してJSONで返却する実装

Webアプリとして使えるようにするため、`doGet` 関数をエントリーポイントに実装する

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

    // atコマンドで扱いやすい時間形式にフォーマット
    return {
      title: event.summary,
      start: dayjs.dayjs(start).subtract(1, 'minute').format("YYYYMMDDHHmm"),
      meetUrl: event.hangoutLink,
    }
  })

  return todayEvent;
}
```

### Webアプリとして公開

デプロイ > 新しいデプロイ > 説明を入力してデプロイ > WebアプリのURLを取得

## atコマンドを有効化

Macのatコマンドはデフォルトでは無効になっているので有効化する。

[Macでatコマンドが実行できないときの対処法 - Qiita](https://qiita.com/shge/items/6c43947a77abd9d2d1b2)
[MacOS で at コマンドを有効化して使ってみる - Neo's World](https://neos21.net/blog/2019/09/13-02.html)

```shell
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
```

`/usr/libexec/atrun` にフルディスクアクセスをつける

## ターミナルで予定一覧を取得して、atコマンドで設定

```shell
curl -L "<GASのWebアプリURL>" | jq -r '.[] | .title + "," + .start + "," + .meetUrl' | awk -F ',' '{ print system("echo open " $3 " | at -t " $2 ) }'
```

## まとめ

毎朝手動でatコマンドを仕込むようにしていて、そこだけは手間だがいまのところこれのおかげで時間になったら作業を止めることができている。

atコマンドはデフォルトで無効になっていて、Macでスケジュール実行のコマンドはlaunchdを使ったほうがいいのではという気がしている。
