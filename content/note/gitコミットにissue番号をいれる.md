---
title: gitコミットにissue番号をいれる
date: "2021-08-11T16:42:00+09:00"
lastmod: '2021-08-11T16:42:46+09:00'
tags:
  - 'git'

---

#git

`.git/hooks/prepare-commit-msg`

```shell
#!/bin/bash -u

# https://qiita.com/koara-local/items/eae7942131e53cb8031a

current_branch=$(git branch | grep "^\*")

if [[ ! "$current_branch" =~ .*/[A-Z]+-[0-9]+.* ]]; then
    exit 0
fi

# e.g. feature/AAA-123-xxx-hogehoge -> AAA-123
issue_id=$(echo "$current_branch" | sed -E 's/^.*\/([A-Z]+-[0-9]+).*$/\1/')

# Insert Issue ID at the beginning of the commit message if it doesn't exist
if [[ ! $(head -n 1 $1 | grep "$issue_id") ]]; then
  sed -i -e '1 s@\(.*\)@'"${issue_id}"' \1@' $1
fi
```
