---
title: XMLをコマンドラインで操作する
date: 2022-01-17T19:19:00+09:00
tags:
- shell
- xml
---

[xmlstarlet](http://xmlstar.sourceforge.net/docs.php) を使ってコマンドライン上で [XPath](note/XPath.md) を使ったselectやupdateが可能になる

## インストール

Macの場合 [Homebrew](note/Homebrew.md) で

````shell
brew install xmlstarlet
````

## 使い方

以下のようなxmlを考える

````xml
<contracts>
    <clients>
        <client ref="123">
            <name>Nicol</name>
        </client>
        <client ref="8234">
            <name>Basil</name>
        </client>
    </clients>
    <entries>
        <entry ref="63352">
            <regCode>BCG</regCode>
        </entry>
        <entry ref="3242">
            <regCode>TYD</regCode>
        </entry>
    </entries>
</contracts>  
````

### 参照

````shell
$ xmlstarlet sel -t -c '//client[@ref="123"]' -t -c '/contracts/entries/entry' temp.xml
<client ref="123">
            <name>Nicol</name>
        </client><entry ref="63352">
            <regCode>BCG</regCode>
        </entry><entry ref="3242">
            <regCode>TYD</regCode>
        </entry>
````

### 更新

#### 値の更新

`inplace` でファイルを書き換える

````shell
$ xmlstarlet ed --inplace -u '/contracts/clients/client[@ref="123"]/name' -v Jack temp.xml
````

結果

````xml:temp.xml
<contracts>
  <clients>
    <client ref="123">
      <name>Jack</name>
    </client>
    <client ref="8234">
      <name>Basil</name>
    </client>
  </clients>
  <entries>
    <entry ref="63352">
      <regCode>BCG</regCode>
    </entry>
    <entry ref="3242">
      <regCode>TYD</regCode>
    </entry>
  </entries>
</contracts>
````

#### attributeの更新

````shell
$ xmlstarlet ed -u '//entry[@ref="3242"]/@ref' -v 99 temp.xml
<?xml version="1.0"?>
<contracts>
  <clients>
    <client ref="123">
      <name>Jack</name>
    </client>
    <client ref="8234">
      <name>Basil</name>
    </client>
  </clients>
  <entries>
    <entry ref="63352">
      <regCode>BCG</regCode>
    </entry>
    <entry ref="99">
      <regCode>TYD</regCode>
    </entry>
  </entries>
</contracts>
````

### 削除

````shell
$ xmlstarlet ed -d '//entry[@ref="3242"]' temp.xml
<?xml version="1.0"?>
<contracts>
  <clients>
    <client ref="123">
      <name>Jack</name>
    </client>
    <client ref="8234">
      <name>Basil</name>
    </client>
  </clients>
  <entries>
    <entry ref="63352">
      <regCode>BCG</regCode>
    </entry>
  </entries>
</contracts>
````

* [Edit xml file using shell script / command](https://superuser.com/questions/916665/edit-xml-file-using-shell-script-command)
* [how to update the xml file using xmlstarlet](https://stackoverflow.com/questions/29265833/how-to-update-the-xml-file-using-xmlstarlet)
* [How to search for a XML node and add or delete it using xmlstarlet](https://stackoverflow.com/questions/50597814/how-to-search-for-a-xml-node-and-add-or-delete-it-using-xmlstarlet)
