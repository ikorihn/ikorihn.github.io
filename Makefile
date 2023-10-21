export: ## Convert Obsidian markdown to common markdown using obsidian-export
	ls content | grep -v -E "(_index.md|private|templates|posts)" | xargs -i rm -rf content/{}
	obsidian-export --frontmatter=always ~/memo content

publish: ## Publish content
	git add content
	git commit -m "update contents: $(shell date +%Y-%m-%dT%H:%M:%S)"
	git push

