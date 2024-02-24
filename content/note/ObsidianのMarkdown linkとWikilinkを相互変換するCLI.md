---
title: ObsidianのMarkdown linkとWikilinkを相互変換するCLI
date: 2024-02-11T15:01:00+09:00
tags:
  - obsidian
---
 
過去に [[Obsidian WikilinkをMarkdown linkに変更した]] が、Obsidianからはしばらく離れないだろうということでやっぱり入力のしやすいWikilinkスタイルに戻そうと思った。

[ozntel/obsidian-link-converter](https://github.com/ozntel/obsidian-link-converter) でも変換することができるが、ファイルが多いと時間がかかるしコードブロックの中のリンクは変えたくなかったりするので、CLIを作ることにした。

## できた

{{< card-link "https://github.com/ikorihn/obsidian-link-converter-cli/" >}}

## 経緯
### markdown parser(=> やめた)

ちゃんとコード解析してやろうかと思ったけど大変そうだったのでやめた。

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

### 正規表現

簡単に正規表現で変換することにした

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

あとはcodeblockの判定とかをすればOK
