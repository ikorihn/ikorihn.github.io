---
title: ObsidianのMarkdown linkをWikilinkに変換するCLI
date: 2024-02-11T15:01:00+09:00
tags:
  - obsidian
---
 
過去に [[Obsidian WikilinkをMarkdown linkに変更した]] が、Obsidianからはしばらく離れないだろうということで入力のしやすいWikilinkスタイルに戻すことにした。

ノート内のすべてのMarkdown linkをWikilinkに変換するには、[ozntel/obsidian-link-converter](https://github.com/ozntel/obsidian-link-converter) を使ってもよいが、コードブロックの中のリンクも書き換わってしまったり、単純に時間がかかったりした。
そこでファイル内のリンクを置換するCLIを作ることにした。

## できたもの

{{< card-link "https://github.com/ikorihn/obsidian-link-converter-cli/" >}}

## やっていること

### ファイル一覧をWalkする

### ファイルパスを最短マッチにする

ObsidianのShortest pathになるように、
- 同一のファイル名が存在するときはディレクトリ名から
- 重複しないときはファイル名のみ

そんなmapを作った

### 正規表現で置換

```go
var mdLinkRegex = regexp.MustCompile(`\[([^\]]+)\]\(([^\)]+)\)`)

func convertByMarkdownParser() error {
	f, err := os.Open("test.md")
	if err != nil {
		return err
	}

	sc := bufio.NewScanner(f)

	for sc.Scan() {
		line := sc.Text()
		matches := mdLinkRegex.FindAllStringSubmatch(line, -1)
		if len(matches) > 0 {
			for i, matche := range matches {
				fmt.Printf("Match! %d %v ==== %v\n", i, matche[1], matche[2])
			}
		}
	}

	return nil
}

```

### codeblockやinline block内のリンクは変換しない

ファイルを上から一行ずつ読んで、`` ^``` `` が現れたらコードブロック開始、再度現れたら終了という簡易的な判定で実現した

### markdown parser(=> やめた)

最初はちゃんとコード解析して、コードブロック外のリンクのみを変換するようにしようと思ったけど大変そうだったのでやめた。

```go
func convertByMarkdownParser() error {
	source, err := os.ReadFile("test.md")
	if err != nil {
		return err
	}

	gm := goldmark.New()
	n := gm.Parser().Parse(text.NewReader(source))
	n.Dump(source, 2)

	err = ast.Walk(n, func(n ast.Node, entering bool) (ast.WalkStatus, error) {

		switch kind := n.(type) {
		case *ast.FencedCodeBlock, *ast.CodeSpan, *ast.CodeBlock:
			return ast.WalkContinue, nil
		case *ast.Link:
			if strings.HasPrefix(string(kind.Destination), "http") {
				return ast.WalkSkipChildren, nil
			}
			fmt.Printf("Link: [%s](%s)\n", string(kind.Title), string(kind.Destination))
			return ast.WalkSkipChildren, nil
		}

		return ast.WalkContinue, nil
	})

	return err
}
```
