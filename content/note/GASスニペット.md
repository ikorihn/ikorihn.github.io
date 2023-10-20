---
title: GASスニペット
date: 2021-06-06T16:09:00+09:00
lastmod: 2021-06-06T16:10:58+09:00
tags:
- GAS
---

\#GAS

# Spreadsheetの操作

## クラス

|||
|:-|:-|
|SpreadsheetApp|Spreadsheetサービスの基底クラス|
|Spreadsheet|Spreadsheetを操作する機能を提供する|
|Sheet|シートを操作する機能を提供する|
|Range|セル範囲を操作する機能を提供する|

## データ操作

<https://developers.google.com/apps-script/guides/sheets>

### データ読み取り

````javascript
function logProductInfo() {
  var spreadSheet = SpreadsheetApp.openById('XXXXXXX'); // スプレッドシートのIDを入力
  var sheet = spreadSheet.getSheetByName('sheet name');
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    Logger.log('Product name: ' + data[i][0]);
    Logger.log('Product number: ' + data[i][1]);
  }
}
````

* スプレッドシートのID
  * <https://docs.google.com/spreadsheets/d/{ID}/edit>
  * URLのID部分

### データ操作

<https://developers.google.com/apps-script/guides/sheets>

#### データ書き込み

````javascript
    function addProduct() {
      var sheet = SpreadsheetApp.getActiveSheet();
      sheet.appendRow(['Cotton Sweatshirt XL', 'css004']);
    }
````

## スプレッドシートマクロ

<https://developers.google.com/apps-script/guides/sheets/macros>

* Excelマクロのような感じ
* UIの一連の操作を記録して、同じ操作を再現できるような機能

## カスタム関数

````javascript
    function GETRESULT(value) {
      if (value >= 80) {
        return 'OK';
      } else {
        return 'NG';
      }
    }
````

セルに `=GETRESULT(A1)` とすると結果が出力される

## Slack との連携

* SlackのAPIトークンを取得する
* UrlFetchでPOST送信する
* [Slack BotをGASでいい感じで書くためのライブラリを作った](https://qiita.com/soundTricker/items/43267609a870fc9c7453)

## ライブラリを作成

<https://qiita.com/t_imagawa/items/47fc130a419b9be0b447>
