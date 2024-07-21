---
title: GAS triggerの設定もGASから行う
date: 2024-07-12T17:32:00+09:00
tags:
  - GAS
---

[[GAS]] のトリガーをGUIから設定するのは簡単だが、再設定したりトリガーの設定自体を管理したい場合は、GASから設定するのが便利です。

```typescript
function triggerOnEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
    const sheet = e.source.getActiveSheet()
    console.log(`Triggered: ${sheet.getName()}, ${e.range.getA1Notation()}, ${e.value}`)
}

function resetOnEditTrigger() {
    const triggerFuncName = 'triggerOnEdit'

    // 設定ずみのトリガーを削除
    ScriptApp.getProjectTriggers()
        .filter((trigger) => trigger.getHandlerFunction() === triggerFuncName)
        .forEach((trigger) => {
            ScriptApp.deleteTrigger(trigger)
        })

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
    ScriptApp.newTrigger(triggerFuncName).forSpreadsheet(sheet).onEdit().create()
}

function createTimebasedTrigger() {
    const triggerFuncName = 'scheduledFunc'
    ScriptApp.newTrigger(triggerFuncName).timeBased().everyDays(1).atHour(17).inTimezone('Asia/Tokyo').create()
}
```

