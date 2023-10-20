---
title: GitコミットログにJIRAのチケット番号を自動付与する
date: 2022-02-21T16:57:00+09:00
tags:
- git
lastmod: 2022-02-21T16:57:00+09:00
---

\#git

コミットメッセージにチケット番号を入れるのはよくある運用ですが、
手動で毎回入れると漏れがでやすいので、自動でチケット番号を入れたいです。
`git config --global commit.template` でコミットメッセージのテンプレートを設定することもできますが、
こちらは固定のテンプレートとなります。
下記の手順を応用すれば、柔軟に他のメッセージを入れることもできます。

### 前提

* ブランチ名の命名規則が `feature/TICKET-9999_foo` であること
* チームのルールでコミットメッセージにチケット番号を入れる(入れてもいい)こと

### スクリプト作成

コミットメッセージの先頭にチケット番号を付与するスクリプトを `~/.git_template/hooks/prepare-commit-msg` に配置する

````bash
$ mkdir -p ~/.git_template/hooks
$ touch ~/.git_template/hooks/prepare-commit-msg
# 実行権限をつける
$ chmod 755 ~/.git_template/hooks/prepare-commit-msg
````

````bash:~/.git_template/hooks/prepare-commit-msg
#!/bin/bash -u

current_branch=$(git branch | grep "^\*")

if [[ ! "$current_branch" =~ .*/[A-Z]+-[0-9]+.* ]]; then
    exit 0
fi

# e.g. feature/AAA-123-foo_bar -> AAA-123
issue_id=$(echo "$current_branch" | sed -E 's/^.*\/([A-Z]+-[0-9]+).*$/\1/')

# 先頭にissue_idを付与
if [[ ! $(head -n 1 $1 | grep "$issue_id") ]]; then
  sed -i -e '1 s@\(.*\)@'"${issue_id}"' \1@' $1
fi
````

### 新しくクローンするリポジトリにデフォルトで設定されるようにする

````bash
$ vim ~/.gitconfig
````

````toml:~/.gitconfig
[init]
  templatedir = ~/.git_template
````

### すでにクローンされているリポジトリに設定する

上記設定をしただけでは、既存のリポジトリには反映されないので、
各リポジトリのディレクトリの `.git/hooks/prepare-commit-msg` に上記スクリプトが配置されている必要がある。

````bash
$ mkdir .git/hooks/
$ cp -p ~/.git_template/hooks/prepare-commit-msg .git/hooks/
````
