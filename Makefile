export: ## Convert Obsidian markdown to common markdown using obsidian-export
	ls content | grep -v -E "(_index.md|archive.md|google.*\.html|private|templates|posts)" | xargs -i rm -rf content/{}
	cp -r ~/obsidian/{note,blog,aboutme} content/

publish: ## Publish content
	git add content
	git commit -m "update contents: $(shell date +%Y-%m-%dT%H:%M:%S)"
	git push

