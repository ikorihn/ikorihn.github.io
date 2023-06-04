---
title: Quartzを使ってObsidianを公開してみた
date: 2023-04-23T10:48:00+09:00
tags:
- 2023/04/23
- obsidian
- blog
lastmod: 2023-05-07T20:42:23+09:00
---

https://ikorihn.github.io/digitalgarden として公開できるようにしたのでそのメモ

## 参考にしたサイト

* [Publishing your Obsidian Vault Online with Quartz](https://brandonkboswell.com/blog/Publishing-your-Obsidian-Vault-Online-with-Quartz/)
* [Quartz: Create and publish your Obsidian Vault for free! : r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/onflb9/quartz_create_and_publish_your_obsidian_vault_for/)

### 同様のことをしているサイト

* https://jzhao.xyz
* https://nick.groenen.me
* https://elaraks.github.io/dampcapital/
* https://blu3mo.github.io/blu3mo-quartz

## Quartz

https://quartz.jzhao.xyz/

* Obsidian VaultをWebサイトにするツール
* バックリンクやマップに対応している
* [Hugo](note/Hugo.md) を使っている

## やったこと

### ファイル修正

* [Hugo](note/Hugo.md) で公開するにあたって、frontmatterの情報を見ているため整備した
  * `title` はもともと入れていたので問題なし
  * `date` をISO-8601(yyyy-MM-ddTHH:mm:ssZ)の形式に変換
    * もともと`yyyy-MM-dd HH:mm` っていう変な形式にしちゃってた
    * `fd -e md | xargs -i sed -i -r 's/^date: (.*) (.*)$/date: "\1T\2:00+09:00"/' {}`
  * `date updaed` を `lastmod` に変換
    * `fd -e md | xargs -i sed -i -r 's/^date updated: (.*) (.*)$/lastmod: "\1T\2:00+09:00"/' {}`
* 画像ファイル名のスペースを除去
  * [Hugo](note/Hugo.md) で埋め込むときにスペースがある場合、`![Pasted image 22222222222.png](</images/Pasted image 22222222222.png>)` のように `<>` で囲む必要がある
  * `rename 's/ /-/g' *`
  * https://github.com/reorx/obsidian-paste-image-rename を使って、画像を貼り付けるときにリネームする
  * [obsidian-export](https://github.com/zoni/obsidian-export) がスペースを％エンコードしてくれたので、結果的には不要だったが、取り扱いはしやすいのでこのままにする

### 公開用リポジトリを作成

Obsidian Vaultを直接公開するのではなく、公開用リポジトリにコピーする形にする。そうすることで、公開範囲を絞ったり、Vault側にはなるべく影響を与えない

* https://github.com/jackyzha0/quartz から作成
* リポジトリ名は `digitalgarden` とした。 `https://ikorihn.github.io/digitalgarden/` でアクセスできる
* GitHub Actionsで `/public` にビルドされて公開されるようになっている

#### [GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages) で公開するための設定

* Branchをmain、ディレクトリを/rootに設定
* `.github/workflows/deploy.yaml` のactions-gh-pages
  * `publish_branch` をmainに合わせる
  * `cname` を `ikorihn.github.io` に変更

![Pasted-image-20230504103549](note/Pasted-image-20230504103549.png)

### obsidian-export

公開したいファイルのみを [Hugo](note/Hugo.md) で扱えるファイルに変換して、公開用リポジトリにコピーする

[brandonkboswell/obsidian-export](https://github.com/brandonkboswell/obsidian-export/tree/title_frontmatter)

* Rustで書かれた、Obsidian Vaultを標準的なMarkdownに変換する(`[[]]` をリンクに変える)
* `.export-ignore` を置くことで、公開対象から除外することができる
* git cloneして `cargo install --path .` して `~/.cargo/bin` にPATH通しておいた

````shell
$ obsidian-export --frontmatter=always ${OBSIDIAN_VAULT_DIR} ${PUBLISH_DIR}
````

### サブディレクトリにあるファイルへのリンクが貼られない

#### 最初に試したこと

* [Hugo relative link](note/Hugo%20relative%20link.md) で説明してくれている内容をrender-links.html, render-images.htmlに書いたらOKだった
* ただgraphやbacklinkの方は、ノードをクリックするとルートからの相対に遷移してしまい、サブディレクトリには遷移しなかった。
  * [Better support for relative/absolute paths · Issue #99 · jackyzha0/quartz](https://github.com/jackyzha0/quartz/issues/99)
  * graph.jsのソースを見たけどちょっとよくわからなかった。とりあえずgraphに表示される名前がURLエンコードされたままとなっていたので、そこだけ直した

#### 直した

絶対パスでないとだめと公式に書いてありました…

{{< card-link "https://quartz.jzhao.xyz/notes/obsidian/" >}}

1. Set the **New link format** to **Absolute Path in vault**. If you have a completely flat vault (no folders), this step isn’t necessary.
1. Turn **on** the **Automatically update internal links** setting.

ただ、Wikilinkがだめとは書いていないが自分の環境ではリンクされなかったため、Markdownの絶対パスでのリンクに変えたところ、graphが正しく表示されるようになった。
このためにObsidianのWikilinkをMarkdown Linkに変更した。

[Obsidian WikilinkをMarkdown linkに変更した](note/Obsidian%20WikilinkをMarkdown%20linkに変更した.md)

### 外部リンクをカードで表示する

[Hugo 外部リンクをカードで表示する](note/Hugo%20外部リンクをカードで表示する.md)

## やってみた感想

カスタマイズが柔軟・自分で作るのが面白かったので自分的にはよかったです。

ただし万人にはおすすめしません…
まあわりと手間だし、日本語ドキュメントもないので素直にObsidian Publishを使うのが便利だし機能も十分に備わっていると思います
