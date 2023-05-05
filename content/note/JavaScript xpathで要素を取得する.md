---
title: JavaScript xpathで要素を取得する
date: 2023-04-27T12:21:00+09:00
tags:
- 2023/04/27
- JavaScript
---


````javascript
function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

getElementByXpath('(//div[@class="font-bold btn"])[1]')
````
