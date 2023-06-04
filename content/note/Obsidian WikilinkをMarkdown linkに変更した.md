---
title: Obsidian WikilinkをMarkdown linkに変更した
date: 2023-05-05T17:44:00+09:00
tags:
- 2023/05/05
- obsidian
---

[Obsidianを公開する](blog/Quartzを使ってObsidianを無料で公開してみた.md) にあたって、Wikilinkのままだとうまくリンクが貼られなかったりして不都合だったので、通常のmarkdown linkに変更した。
公開するためだけじゃなく、 [Obsidian](note/Obsidianとは.md) からもし移行するとなってもいいように変更したかった。

## 設定

まず今後作成するときにmarkdown linkが使われるようにObsidianの設定を変更する

![](note/Pasted-image-20230505054503.png)

## 既存のリンクを変更する

プラグインを使うのがはやかった。

[ozntel/obsidian-link-converter: Obsidian Plugin to scan all your links in your vault and convert them to your desired format.](https://github.com/ozntel/obsidian-link-converter)

しかし以下の問題があった。

* 日本語のファイル名がURLエンコードされる
  * `[ノート](note/ノート.md)` と記述されてほしいが、エンコードされて `[ノート](note/%E3%83%8E%E3%83%BC%E3%83%88.md)` となる
* 正規表現で `[[` を変換するので、ファイルが存在しなくても変換されてしまう

### 正しく変換されるよう、パッチをあてる

* 日本語がエンコードされないようにする
  * ただしスペースはエンコードされていてほしい `[ノート](note/my ノート.md)` -> `[ノート](note/my%20ノート.md)`

````diff
--- a/src/converter.ts
+++ b/src/converter.ts
@@ -293,7 +303,9 @@ const createLink = (dest: LinkType, originalLink: string, altOrBlockRef: string,
         } else {
             altText = file ? file.basename : finalLink;
         }
-        return `[${altText}](${encodeURI(finalLink)}${fileExtension})`;
+        finalLink = finalLink.replace(/ /g, '%20')
+        return `[${altText}](${finalLink}${fileExtension})`;
     } else if (dest === 'wikiTransclusion') {
         return ``;
     } else if (dest === 'mdTransclusion') {
@@ -305,7 +317,8 @@ const createLink = (dest: LinkType, originalLink: string, altOrBlockRef: string,
         } else {
             encodedBlockRef = encodeURI(encodedBlockRef);
         }
-        return `[](${encodeURI(finalLink)}${fileExtension}#${encodedBlockRef})`;
+        finalLink = finalLink.replace(/ /g, '%20')
+        return `[](${finalLink}${fileExtension}#${encodedBlockRef})`;
     }

     return '';
````

* 存在しないリンクは変換しないようにする
  * ファイルが存在するかどうかをチェックして、なければなにもしない

````diff
--- a/src/converter.ts
+++ b/src/converter.ts
@@ -193,6 +193,9 @@ export const convertWikiLinksToMarkdown = async (md: string, sourceFile: TFile,
     let wikiMatches = linkMatches.filter((match) => match.type === 'wiki');
     for (let wikiMatch of wikiMatches) {
         let mdLink = createLink('markdown', wikiMatch.linkText, wikiMatch.altOrBlockRef, sourceFile, plugin);
+        if (!mdLink) {
+            continue;
+        }
         newMdText = newMdText.replace(wikiMatch.match, mdLink);
     }
     // --> Convert Wiki Transclusion Links to Markdown Transclusion
@@ -267,6 +270,11 @@ const createLink = (dest: LinkType, originalLink: string, altOrBlockRef: string,
     let finalLink = originalLink;
     let altText: string;

+    const matchFile = plugin.app.vault.getFiles().find(t => sourceFile.name !== t.name && (t.basename === finalLink || t.name === finalLink))
+    if (!matchFile) {
+        return '';
+    }
+
     let fileLink = decodeURI(finalLink);
````
