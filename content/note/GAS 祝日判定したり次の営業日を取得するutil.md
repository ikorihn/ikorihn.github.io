---
title: GAS 祝日判定したり次の営業日を取得するutil
date: 2023-12-01T10:36:00+09:00
tags:
- GAS
---

[GAS](note/GAS.md) のトリガーを毎日にしておいて、営業日のみ処理をしたいということがよくあるので、土日祝を判定して次の営業日を取得する方法をメモ

## 土日祝をする

土日は `Date.getDay()` の値が0=日曜、6=土曜で判定できる。
祝日を判定するには、一般公開されている `ja.japanese#holiday@group.v.calendar.google.com` のカレンダーから、その日に終日のEventが設定されているかどうかを使える。

````ts
/**
 * 土日祝かどうかを判定する
 */
export function isHoliday(date: Date): boolean {
    if (date.getDay() === 0 || date.getDay() === 6) {
        return true
    }
    // 祝日判定
    const holiday = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com')
    return holiday.getEventsForDay(date).length > 0
}
````

## 営業日を取得する

上の土日祝判定をつかって、次の営業日を取得する。

````ts
/**
 * 与えられた日付の次の営業日を返す 引数が営業日だったらそのまま
 */
export function nextBusinessDay(date: Date): Date {
    if (isHoliday(date)) {
        return nextBusinessDay(new Date(date.getTime() + 1000 * 60 * 60 * 24 * 1))
    }
    return date
}
````

## おまけ

### 指定した日付の次のx曜日を取得する

````ts
export function nextDayOfWeek(date: Date, dayOfWeek: number): Date {
    const newDate = new Date(date.getTime())
    let diff = (dayOfWeek - date.getDay() + 7) % 7
    if (diff === 0) {
        diff = 7
    }
    newDate.setDate(date.getDate() + diff)
    return newDate
}
````

### 指定した日付の曜日を日本語で取得する

````ts
export function getJapaneseDayOfWeek(date: Date): string {
    const japanese_day_of_week = ['日', '月', '火', '水', '木', '金', '土']
    return japanese_day_of_week[date.getDay()]
}
````
