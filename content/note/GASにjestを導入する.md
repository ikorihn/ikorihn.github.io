---
title: GASにjestを導入する
date: 2021-06-06T16:23:00+09:00
lastmod: 2021-06-06T18:47:06+09:00
tags:
- GAS
- TypeScript
- unittest
---

clasp + TypeScriptであることが前提

* [GASをclaspでローカルで書く](GASをclaspでローカルで書く.md)
* [GASをTSで書けるようにする](GASをTSで書けるようにする.md)

````shell
$ npm install -D @types/jest jest ts-jest
````

`jest.config.js`

````javascript
module.exports = {
    preset: 'ts-jest',
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],
    globals: { SpreadsheetApp: {}, UrlFetchApp: {}, Utilities: {} },
}
````

### globalsとは

GAS固有の型定義をmockするための設定

GAS上ではSpreadsheetAppが使えたりするが、ローカルで実行するときには当然存在しないため、window.SpreadsheetAppを定義している

メソッド数の多いinterfaceを実装するのは大変なので、
<https://github.com/marchaos/jest-mock-extended>
などを使う

````javascript
import { mock } from 'jest-mock-extended'

describe('test', () => {
    const values = [
        ['Bob', new Date('2021-01-02T15:04:05')]
        ['Alice', new Date('2021-02-03T15:04:05')]
    ]

    // SpreadsheetAppをmockする
    const mockRange = mock<GoogleAppsScript.Spreadsheet.Range>()
    mockRange.getValues.mockReturnValue(values)
    const mockSheet = mock<GoogleAppsScript.Spreadsheet.Sheet>()
    mockSheet.getRange.mockReturnValue(mockRange)
    const mockSpreadsheet = mock<GoogleAppsScript.Spreadsheet.Spreadsheet>()
    mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet)
    SpreadsheetApp.getActiveSpreadsheet = jest.fn(() => {
        return mockSpreadsheet
    })

    // Utilitiesをmockする
    Utilities.formatDate = jest.fn((date: Date) => {
        return `${date.getFullYear()}-${date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${
            date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        }T${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${
            date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        }:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`
    })

    const actual = doFormat()

    expect(mockSheet.getRange).toHaveBeenCalledTimes(1)
    expect(actual).toBe('2021-01-02T15:04:05')
}

export function doFormat() {
    // sheetを取得
    const mysheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('mysheet')
    // セルの値を配列で取得
    const values = mysheet.getRange(1, 1, 2, 2).getValues()
    // 日付フォーマット
    const formatted = Utilities.formatDate(values[0][1])
    return formatted
}

````
