---
title: Quartzを使ってObsidianを無料で公開してみた
date: '2023-04-23T10:48:00+09:00'
tags:
  - '2023/04/23'
  - 'obsidian'
  - blog
lastmod: '2023-06-05T00:53:34+09:00'
---

私は普段 [[Obsidianとは|Obsidian]] でメモを取るようにしています。
ある程度まとまった内容ができたら都度 [Zenn](https://zenn.dev/) やブログに書くようにしていたのですが、記事にするぞ！と思うときちんと書かないといけないと思い腰が重くてなかなかできていませんでした。

そこで、取ったメモを雑なままでいいから公開しようと思いました。

まず選択肢としてあがるのは [Obsidian Publish](https://obsidian.md/publish) ですが、月$8(2023/06現在)が自分には高く、機能もそこまで必要としていないので、多少手間がかかっても無料で公開できる方法を調べました。

## できたもの

{{< card-link "https://ikorihn.github.io/digitalgarden" >}}

- [brandonkboswell/obsidian-export](https://github.com/brandonkboswell/obsidian-export/tree/title_frontmatter) を使って、公開していいファイルだけをexportするようにしました
- [Quartz](https://quartz.jzhao.xyz/) のテンプレートを使って、マークダウンをHTMLで表示するだけでなくバックリンクやグラフも生成されるようにしました

### 参考にしたサイト

- [Publishing your Obsidian Vault Online with Quartz](https://brandonkboswell.com/blog/Publishing-your-Obsidian-Vault-Online-with-Quartz/)
- [Quartz: Create and publish your Obsidian Vault for free! : r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/onflb9/quartz_create_and_publish_your_obsidian_vault_for/)

### 同様のことをしているサイト

- https://jzhao.xyz
- https://nick.groenen.me
- https://elaraks.github.io/dampcapital/
- https://blu3mo.github.io/blu3mo-quartz

## Quartz のセットアップ

{{< card-link "https://quartz.jzhao.xyz/" >}}

- Obsidian VaultをWebサイトにするツール
- バックリンクやマップに対応している
- [[Hugo]] を使っている

セットアップは基本的にドキュメントに書いてあるとおりですが、以下のように進めました。

### リポジトリの作成

Obsidian Vaultを直接公開するのではなく、公開用リポジトリを別途作ってそちらにコピーすることにします。そうすることで、公開範囲を絞ったり、Vault側にはなるべく影響を与えないようにしています。

https://github.com/jackyzha0/quartz をForkして作成しました。
このとき、 `Copy the `hugo` branch only` のオプションはチェックを外します。

リポジトリ名は `digitalgarden` としました。これを[GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages) で公開すると`https://ikorihn.github.io/digitalgarden/` でアクセスできるようになります。

#### GitHub Pages で公開するための設定

- Branchをmain、ディレクトリを/rootに設定
- `.github/workflows/deploy.yaml` の `name: Deploy` を修正します
    -  `hugo` ブランチにpushすると、GitHub Actionsでビルドしたファイルが `main` ブランチの `/public` ディレクトリに置かれるようになっています
    - `publish_branch` をmain、 `cname` を `ikorihn.github.io` にしました
- GitHubリポジトリのSettings > Pagesで公開対象を設定します

![[note/Pasted-image-20230504103549.png|Pasted-image-20230504103549]]

## Obsidian Vaultから公開したいファイルのみをコピーする

公開したいファイルのみを [[Hugo]] で扱えるファイルに変換して、公開用リポジトリにコピーします。
それにはこちらを使いました。

{{< card-link "https://github.com/zoni/obsidian-export" >}}

- Rust製
- Obsidian Vault内のファイルを標準的なMarkdownに変換して別のディレクトリにコピーする(`[[]]` を標準のリンクに変えるなど)
- `.export-ignore` を置くことで、export対象から除外することができる

git cloneして `cargo install --path .` して `~/.cargo/bin` にPATHを通したら、
公開用リポジトリのルートで以下を実行して、 `./content` 配下にObsidianの中身をコピーします。

```shell
$ obsidian-export --frontmatter=always ${OBSIDIAN_VAULT_DIR} ./content
```

`content` は [HugoでWebサイトのコンテンツを配置するディレクトリ](https://gohugo.io/getting-started/directory-structure/) です。

コピーができたら `hugo` ブランチにcommitしてpushしましょう。
これでGitHub Actionsが動いて、少し経つとGitHub Pagesのドメインで見れるようになっているはずです。

## 公開フローを整える

Obsidian Vaultからファイルをコピーする → commitしてpushする
のをそれぞれmakeで実行できるようにしておきます。
自分の場合は、Obsidianを `~/memo` においているのでこちらのようになります。

```Makefile
export: ## Convert Obsidian markdown to common markdown using obsidian-export
	ls content | grep -v -E "(_index.md|private|templates)" | xargs -i rm -rf content/{}
	obsidian-export --frontmatter=always ~/memo content

publish: ## Publish content
	git add content
	git commit -m "update contents: $(shell date +%Y-%m-%dT%H:%M:%S)"
	git push
```

## その他やったこと

基本的に公開するために必要なことはここまでとなります。

自分の場合、過去作成してきたマークダウンファイルの書き方がよろしくなかったりHugoの都合に合わなかったりしたため、まとめて修正を行いました。

### ファイル修正

- [[Hugo]] のためにfrontmatterを整備しました
    - `title` (ページタイトル) `date` (作成日) `lastmod` (更新日) を各ファイルに入れました
    - `title` は元々入れていたので、抜けているファイルに手動で追加
        - https://github.com/brandonkboswell/obsidian-export/tree/title_frontmatter を使って `--add-titles` オプションによってexport時に付与するのもアリ
    - `date` をyyyy-MM-ddTHH:mm:ssZの形式に変換
        - 元々 `yyyy-MM-dd HH:mm` っていう変な形式にしちゃってた
        - `fd -e md | xargs -i sed -i -r 's/^date: (.*) (.*)$/date: "\1T\2:00+09:00"/' {}`
    - `date updaed` を `lastmod` に変換
        - `fd -e md | xargs -i sed -i -r 's/^date updated: (.*) (.*)$/lastmod: "\1T\2:00+09:00"/' {}`
- 画像ファイル名のスペースを除去
    - [[Hugo]] で埋め込むときにスペースがある場合、`![Pasted image 22222222222.png](</images/Pasted image 22222222222.png>)` のように `<>` で囲む必要がある
    - `rename 's/ /-/g' *`
    - https://github.com/reorx/obsidian-paste-image-rename を使って、今後画像を貼り付けるときにはスペース除去するようにする
    - [obsidian-export](https://github.com/zoni/obsidian-export) がスペースを％エンコードしてくれたので結果的には不要だったが、取り扱いはしやすいのでこのままにする

### サブディレクトリにあるファイルへのリンクが貼られない

Vaultのルート直下にあるファイルについてはちゃんとリンクが機能するのですが、ディレクトリの下のファイルに関しては遷移できませんでした。

#### 最初に試したこと

- [[Hugo relative link]] で説明してくれている内容をrender-links.html, render-images.htmlに書いたらOKだった
- ただgraphやbacklinkの方は、ノードをクリックするとルートからの相対に遷移してしまい、サブディレクトリには遷移しなかった。
    - [Better support for relative/absolute paths · Issue #99 · jackyzha0/quartz](https://github.com/jackyzha0/quartz/issues/99)

#### 直した

絶対パスでないとだめと公式に書いてありました…

{{< card-link "https://quartz.jzhao.xyz/notes/obsidian/" >}}

1.  Set the **New link format** to **Absolute Path in vault**. If you have a completely flat vault (no folders), this step isn’t necessary.
2.  Turn **on** the **Automatically update internal links** setting.

Wikilink(`[[note/xxxx]]`)でも問題なさそうなのですが、自分の環境ではリンクされなかったため、Markdownの絶対パスでのリンク(`[xxxx](note/xxxx.md)`)に変えたところ、graphが正しく表示されるようになりました。

これのために、全ファイルのWikilinkをMarkdown Linkに変更しました。。

[[Obsidian WikilinkをMarkdown linkに変更した]]

### 外部リンクをカードで表示する

Zennとかで見るやつ

[[Hugo 外部リンクをカードで表示する]]

## 感想

無事Obsidianを公開できるようになりました。
更新の手間が若干ありますが、簡単なコマンドで更新できるのでさほど苦ではないでしょう。

今までブログを書いたりするのは億劫でなかなかできていなかったのですが、メモのついでに公開しているというスタンスであれば気軽に続けられそうです。

Obsidian Publishと比べてどうかというと、
まず自分でいろいろ調べて作るのが面白かったので個人的にはよかったです。
QuartzのベースはHugoですので、テーマやテンプレートのカスタマイズも自分で行えます。

ただし万人にはおすすめしません…
まず構築がそこそこ手間でしたし、こういうことやっている人自体が少ないので情報があまりなく、トラブルシューティングが結構たいへんです。
自力で解決するのが難しいという場合は、素直にObsidian Publishを使うのが便利ですし機能も十分に備わっていると思います。
