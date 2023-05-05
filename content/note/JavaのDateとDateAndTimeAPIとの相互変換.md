---
title: JavaのDateとDateAndTimeAPIとの相互変換
date: 2021-06-16T16:22:00+09:00
lastmod: 2021-06-16T16:24:37+09:00
tags:
- Java
---

\#Java

<https://javazuki.com/articles/date-calendar-convert-to-datetime.html>

# Date/Calendar↔Date And Time API系変換のまとめ

Date/Calendar↔Date And Time API系の変換は、Instantを介して行う。それぞれのクラスでInstantを直接扱えるのかどうかなどが異なるため、手順をまとめる。

## Date/Calendar→Date And Time API系の変換

![](https://javazuki.com/images/javase/date-and-time-api/DateOrCalendar%E3%81%8B%E3%82%89XXXDateTime%E3%81%B8%E3%81%AE%E5%A4%89%E6%8F%9B.png)

Date/CalendarからDate And Time API系へ変換する場合は、まずXXXDateTimeへの変換を考える。｢LocalDate｣｢LocalTime｣｢Year｣｢YearMonth｣などはXXXDateTimeから変換メソッドが用意されているので、とりあえずXXXDateTimeにしてしまう。

Date/CalendarからXXXDateTimeへの変換はInstantを介して行う。Date/CalendarにはInstantを取得できるtoInstant()メソッドが、Java8から追加された。Instantはエポック時間からの経過秒が保持されている。ただしInstantだけでは表現したい時差やタイムゾーンが不明のため、XXXDateTimeにするには｢ZoneId｣or｢ZoneOffset｣が必要になる。システムデフォルトのZoneIdはZoneId.systemDefault()で取得できる。

### Date→LocalDateTime

LocalDateTimeの場合、エポック秒から生成できるofEpochSecond()が用意されている。ただZoneIdからZoneOffsetを取得するのは手順が面倒なため、instantとzoneIdで生成できるofInstant()が用意されている。それを利用する。

Date→LocalDateTimeへの変換

````java
Date date = new Date();

Instant instant = date.toInstant();
ZoneId zone = ZoneId.systemDefault();
LocalDateTime converted = LocalDateTime.ofInstant(instant, zone);
````

### Date→OffsetDateTime

OffsetDateTimeの場合、｢ZoneId｣｢ZoneOffset｣のどちらからでも生成できる。ZoneIdはZoneOffsetの情報を取得できるので可能。

OffsetDateTimeへの変換(ZoneOffset利用)

````java
Date date = new Date();

Instant instant = date.toInstant();
ZoneOffset offset = ZoneOffset.ofHours(9);
OffsetDateTime converted = instant.atOffset(offset);
````

OffsetDateTimeへの変換(ZoneId利用)

````java
Date date = new Date();

Instant instant = date.toInstant();
ZoneId zone = ZoneId.systemDefault();
OffsetDateTime converted = OffsetDateTime.ofInstant(instant, zone);
````

### Date→ZonedDateTime

ZonedDateTimeの場合、instantとzoneIdから生成できる。InstantクラスにもZonedDateTimeを生成できるファクトリがあるが、内部的に ZonedDateTime.ofInstant()呼び出すのでどちらでもいい。

ZonedDateTimeへの変換

````java
Date date = new Date();

Instant instant = date.toInstant();
ZoneId zone = ZoneId.systemDefault();
ZonedDateTime converted = ZonedDateTime.ofInstant(instant, zone);
````

### Calendar→LocalDateTime,OffsetDateTime,ZonedDateTime

CalendarもtoInstant()があるのでInstantを介した変換が可能。instant取得後は同様の手順。

LocalDateTimeへの変換

````java
Calendar calendar = Calendar.getInstance();

Instant instant = calendar.toInstant();
ZoneId zone = ZoneId.systemDefault();
LocalDateTime converted = LocalDateTime.ofInstant(instant, zone);
````

## Date And Time API系→Date/Calendarの変換

[![XXXDateTimeからDateOrCalendarへの変換](https://javazuki.com/images/javase/date-and-time-api/XXXDateTime%E3%81%8B%E3%82%89DateOrCalendar%E3%81%B8%E3%81%AE%E5%A4%89%E6%8F%9B.png)](https://javazuki.com/articles/date-calendar-convert-to-datetime.html#)

Figure 2. Date And Time API系からDate/Calendarへの変換

Date And Time API系からDate/Calendarへ変換する場合は、まず｢OffsetDateTime｣｢ZonedDateTime｣への変換を考える。Instantを取得することでDate/Calendarへの変換が可能になる。ただし、InstantからCalendarを直接生成することができない。Dateを生成してからCalendarへ変換する手順になる。

Date/Calendarへの変換においては、LocalDateTimeが直接Instatntを作れない。LocalDateTimeが示している日時がどの時差あるいはタイムゾーンなのかの情報を持たないため、Instantは生成できないことになる。よって｢LocalDate｣｢LocalTime｣｢Year｣｢YearMonth｣などと同様に、｢OffsetDateTime｣｢ZonedDateTime｣を経由してInstantを生成する。

### LocalDateTime→Date

LocalDateTimeからInstantは直接生成できないので、OffsetDateTime かZonedDateTimeを経由する。

LocalDateTime→Dateへの変換

````java
LocalDateTime localDateTime = LocalDateTime.now();
ZoneId zone = ZoneId.systemDefault();
ZonedDateTime zonedDateTime = ZonedDateTime.of(localDateTime, zone);

Instant instant = zonedDateTime.toInstant();
Date date = Date.from(instant);
````

### OffsetDateTime→Date

OffsetDateTimeはInstantを生成できるので、そのまま変換可能。

OffsetDateTime→Dateへの変換

````java
OffsetDateTime offsetDateTime = OffsetDateTime.now();
Instant instant = offsetDateTime.toInstant();
Date date = Date.from(instant);
````

### ZonedDateTime→Date

ZonedDateTimeはInstantを生成できるので、そのまま変換可能。

ZonedDateTime→Dateへの変換

````java
ZonedDateTime zonedDateTime = ZonedDateTime.now();
Instant instant = zonedDateTime.toInstant();
Date date = Date.from(instant);
````

### LocalDateTime,OffsetDateTime,ZonedDateTime→Calendar

CalendarはInstantを生成できるが、InstantからCalendarを生成できない。Dateを経由して、Date→Calendar変換を行う。｢OffsetDateTime｣｢ZonedDateTime｣も同様の手順。

LocalDateTime→Calendarへの変換

````java
LocalDateTime localDateTime = LocalDateTime.now();
ZoneId zone = ZoneId.systemDefault();
ZonedDateTime zonedDateTime = ZonedDateTime.of(localDateTime, zone);

Instant instant = zonedDateTime.toInstant();
Date date = Date.from(instant);

Calendar calendar = Calendar.getInstance();
calendar.setTime(date);
````

## GregorianCalendar↔ZonedDateTimeの変換

Calendarの中でもGregorianCalendarのみ特殊で、ZonedDateTimeと相互変換が可能。

GregorianCalendarがグレゴリオ暦かつタイムゾーンを保持しているので、ZonedDateTimeととても近いため。ただしGregorianCalendarとZonedDateTimeはユリウス/グレゴリオ暦の切換え日のサポート有無が異なるため、そこだけ注意。

GregorianCalendar→ZonedDateTimeへの変換

````java
GregorianCalendar gregorianCalendar = new GregorianCalendar();
ZonedDateTime converted = gregorianCalendar.toZonedDateTime();
````

ZonedDateTime→GregorianCalendarへの変換

````java
ZonedDateTime zonedDateTime = ZonedDateTime.now();
GregorianCalendar gregorianCalendar = GregorianCalendar.from(zonedDateTime);
````

## Appendix A: 参考

* [Instant（Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/time/Instant.html)
* [LocalDateTime（Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/time/LocalDateTime.html)
* [OffsetDateTime （Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/time/OffsetDateTime.html)
* [ZonedDateTime（Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/time/ZonedDateTime.html)
* [Date （Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/util/Date.html)
* [Calendar （Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/util/Calendar.html)
* [GregorianCalendar （Java SE 8 API仕様）](http://docs.oracle.com/javase/jp/8/docs/api/index.html?java/util/GregorianCalendar.html)

# 関連記事リンク

* Java標準ライブラリ
  * java.time
    * [Date And Time APIとは](https://javazuki.com/articles/date-and-time-api-introcution.html)
    * [Date And Time APIとISO8601](https://javazuki.com/articles/date-and-time-api-iso8601.html)
    * [Date And Time APIの日時クラス](https://javazuki.com/articles/date-and-time-api-classes.html)
    * Date/Calendar↔Date And Time API系変換のまとめ ← この記事
    * [java.sql日時クラス↔Date And Time API系の変換](https://javazuki.com/articles/sql-date-conver-to-datetime.html)
    * [Date And Time APIの和暦サポート](https://javazuki.com/articles/japanese-date-introduction.html)
