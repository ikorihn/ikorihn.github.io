---
title: remark Markdownパーサーの使い方
date: 2023-09-11T15:22:00+09:00
---

[[Quartz v4アップデート]] したところ、preactとremarkの知識が必要になったので調べた。
いくつかの用語や概念を知っている必要があって、初学者には厳しかったので調べたことをまとめておく。

## unified

テキストからASTを作成したり、そのAST木を解析して別のテキストに変換したりするためのJavaScript製フレームワークのこと。

https://unifiedjs.com

構文木は自然言語を名詞や動詞など、構文にそって解析して木構造としたもので、 Abstract Syntax Tree(AST, 抽象構文木)はその構文木から、文法のための記号や助詞など、意味のない部分を除いた木構造。

parser, compiler, transformerといった各コンポーネントに分かれて、ファイルを仮想化したvfile(virtualized file)を用いてデータを受け渡しする

### remark

unifiedの中でMarkdownの処理を担当する。
Markdownをparseする [remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)、compileする[remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify)、ASTやHTMLへの変換を担当する各transformerがある。

MarkdownのASTをmdastという。

### rehype

unifiedの中でHTMLの処理を担当する。
HTMLのASTをhastという。


## unifiedの処理の流れ

https://github.com/unifiedjs/unified#overview に図が書かれている通りで、
Input -> parser -(ASTに変換)-> transformer -> compiler -> Output として

```javascript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';

const processer = unified()
    .use(remarkParse) // MarkdownをparseしてASTを作成
    .use(remarkRehype) // MarkdownからHTMLのASTに変換
    .use(rehypeStringify); // HTMLのASTをテキストに変換

const markdownText = fs.readFileSync('./content/hello.md');

const markdownTree = processer.parse(markdownText);
const htmlTree = await processer.run(markdownTree);
const htmlText = processer.stringify((htmlTree as any));
```

## transformerの作成

ASTに対して独自の編集を行うためtransformerを作成する。

### トラバース


[unist-util-visit](https://github.com/syntax-tree/unist-util-visit) を使う。

```typescript
import { Literal, Node, Parent } from "unist"
import { Paragraph, Text, Link } from "mdast"
import { VFile } from "vfile"
import { visit } from "unist-util-visit"

const transformer = () => {
  return (tree: Node, file: VFile) => {
    // Paragraph型のノードを探して処理する
    visit(tree, "paragraph", (paragraghNode: Paragraph, index: number, parent: Parent) => {
      const child0 = paragraghNode.children[0]
      if (isText(child0)) {
        console.log(child0.value)
      }
    })
  }
}

function isText(node: Node): node is Text {
  return (
    node.type === "text" && typeof node.value === "string"
  );
}
```

### 現在のASTを表示する

プラグイン開発にあたって、現在のASTがどうなっているかを確認するために便利なヘルパーが用意されている。
[unist-util-inspect](https://github.com/syntax-tree/unist-util-inspect) の `inspect` にtreeを渡すと、木構造をprintできる。

```typescript
import unified from "unified";
import { Node } from "unist";
import { VFile } from "vfile";
import { inspect } from "unist-util-inspect";

const print: unified.Plugin = () => {
  return (tree: Node, file: VFile) => {
    console.log(inspect(tree));
  };
};

/* 以下のようなツリーが出力される
├─0 yaml "title: hoge" (1:1-4:4, 0-53)
├─1 paragraph[2] (6:1-6:116, 55-170)
│   ├─0 link[1] (6:1-6:46, 55-100)
│   │   │ title: null
│   │   │ url: "https://github.com/"
│   │   └─0 text "GitHub" (6:2-6:8, 56-62)
│   └─1 text " を参照する " (6:46-6:53, 100-107)
├─2 paragraph[1] (8:1-8:73, 172-244)
│   └─0 link[1] (8:1-8:73, 172-244)
│       │ title: null
│       │ url: "note/sample2.md"
│       └─0 text "this is sample" (8:2-8:34, 173-205)
└─3 list[4] (10:1-13:32, 246-362)
    │ ordered: false
    │ start: null
    │ spread: false
    ├─0 listItem[1] (10:1-10:22, 246-267)
    │   │ spread: false
....
*/
```

## 参考リンク

- [Markdown を型付きオレオレ AST に変換する | giraphme/blog](https://giraph.me/articles/unified-with-ts/)
- [unified を使って Markdown を拡張する](https://zenn.dev/januswel/articles/745787422d425b01e0c1)
- [Markdownパーサーremarkの使い方メモ - 新しいことにはウェルカム](https://www.kwbtblog.com/entry/2023/02/25/192520)
- [Remark で広げる Markdown の世界](https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol2/spring-raining/index.html)
