---
title: Bitbucket Pipelinesでmasterブランチとファイル比較をしたい
date: "2023-03-28T16:40:00+09:00"
tags: 
    - '2023/03/28'
---

pipelineで、masterブランチとのファイル比較をしようとして、masterをcheckoutした

```yaml
default:
  step:
    - git remote -v
    - git branch -a
    - git fetch origin
    - git checkout master
    - git diff master...${BITBUCKET_BRANCH}
```

するとエラーになった。masterブランチがfetchできていない

```
origin  git@bitbucket.org:foo/repo (fetch)
origin  git@bitbucket.org:foo/repo (push)

feature/bar
remote/origin/feature/bar

error: pathspec 'master' did not match any file(s) known to git.
```

解決策は2つ
[Solved: Can't checkout master on a branch pipeline](https://community.atlassian.com/t5/Bitbucket-questions/Can-t-checkout-master-on-a-branch-pipeline/qaq-p/1004778)

`clone.depth: full` をつける

```yaml
clone:
  depth: full
  
pipelines:
  default:
    - step:
        name: Cloning
        script:
          - echo "Clone all the things!"
```

`git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"` をstep内で行う

```yaml
clone:
  depth: full
  
pipelines:
  default:
    - step:
      script:
        - git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
        - git fetch origin
        - git checkout --track origin/master

```

これでファイル比較できるようになった

```yaml
clone:
  depth: full

pipelines:
  default:
    step:
      - git remote -v
      - git branch -a
      - git fetch origin
      - git checkout master
      - git diff master...${BITBUCKET_BRANCH}
```
