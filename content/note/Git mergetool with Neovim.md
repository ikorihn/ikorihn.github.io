---
title: Git mergetool with Neovim
date: 2024-07-04T14:18:00+09:00
tags:
  - Neovim
  - git
---

[[Git]] のコンフリクトを解消するために、[[Neovim]] をmergetoolとして使いたい。

## 設定

gitconfigに、以下の通り設定する

```
[mergetool "neovimdiff"]
  cmd = nvim -d $LOCAL $MERGED $REMOTE -c 'wincmd l' -c 'wincmd J'
[merge]
  tool = neovimdiff
```

- `nvim -d` [[Neovim]] をdiffモードで開く
- `-c "wincmd l" -c "wincmd J"` 一個右のペイン(MERGED)にフォーカスを移動して、画面下半分に分割する

または組み込みで以下のmergetoolが定義されているので、 [mergetool.layout](https://git-scm.com/docs/git-mergetool#_layout_configuration) でレイアウトをカスタマイズしてもよい

```
❯ git mergetool --tool-help
'git mergetool --tool=<tool>' may be set to one of the following:
                araxis           Use Araxis Merge (requires a graphical session)
                nvimdiff         Use Neovim with a custom layout (see `git help mergetool`'s `BACKEND SPECIFIC HINTS` section)
                nvimdiff1        Use Neovim with a 2 panes layout (LOCAL and REMOTE)
                nvimdiff2        Use Neovim with a 3 panes layout (LOCAL, MERGED and REMOTE)
                nvimdiff3        Use Neovim where only the MERGED file is shown
                opendiff         Use FileMerge (requires a graphical session)
                vimdiff          Use Vim with a custom layout (see `git help mergetool`'s `BACKEND SPECIFIC HINTS` section)
                vimdiff1         Use Vim with a 2 panes layout (LOCAL and REMOTE)
                vimdiff2         Use Vim with a 3 panes layout (LOCAL, MERGED and REMOTE)
                vimdiff3         Use Vim where only the MERGED file is shown

        user-defined:
                neovimdiff.cmd nvim -d $LOCAL $REMOTE $MERGED -c '$wincmd w' -c 'wincmd J'

The following tools are valid, but not currently available:
                bc               Use Beyond Compare (requires a graphical session)
                bc3              Use Beyond Compare (requires a graphical session)
                bc4              Use Beyond Compare (requires a graphical session)
                codecompare      Use Code Compare (requires a graphical session)
                deltawalker      Use DeltaWalker (requires a graphical session)
                diffmerge        Use DiffMerge (requires a graphical session)
                diffuse          Use Diffuse (requires a graphical session)
                ecmerge          Use ECMerge (requires a graphical session)
                emerge           Use Emacs' Emerge
                examdiff         Use ExamDiff Pro (requires a graphical session)
                guiffy           Use Guiffy's Diff Tool (requires a graphical session)
                gvimdiff         Use gVim (requires a graphical session) with a custom layout (see `git help mergetool`'s `BACKEND SPECIFIC HINTS` section)
                gvimdiff1        Use gVim (requires a graphical session) with a 2 panes layout (LOCAL and REMOTE)
                gvimdiff2        Use gVim (requires a graphical session) with a 3 panes layout (LOCAL, MERGED and REMOTE)
                gvimdiff3        Use gVim (requires a graphical session) where only the MERGED file is shown
                kdiff3           Use KDiff3 (requires a graphical session)
                meld             Use Meld (requires a graphical session) with optional `auto merge` (see `git help mergetool`'s `CONFIGURATION` section)
                p4merge          Use HelixCore P4Merge (requires a graphical session)
                smerge           Use Sublime Merge (requires a graphical session)
                tkdiff           Use TkDiff (requires a graphical session)
                tortoisemerge    Use TortoiseMerge (requires a graphical session)
                winmerge         Use WinMerge (requires a graphical session)
                xxdiff           Use xxdiff (requires a graphical session)

```

```
[merge]
  tool = nvimdiff
[mergetool "nvimdiff"]
  layout = "LOCAL,BASE,REMOTE / MERGED"
```

## テスト

リポジトリ初期化
```shell
❯ mkdir test-mergetool
❯ cd test-mergetool
❯ git init
```

`hello.txt` をコミット

```shell
❯ vim hello.txt
❯ cat hello.txt
hello1
hello2
hello3
hello4
hello5
hello6
hello7
hello8
hello9
hello10

❯ git add .
❯ git commit -m 'initialize'
[main (root-commit) 3c45a3e] initialize
 1 file changed, 10 insertions(+)
 create mode 100644 hello.txt
 ```

別ブランチで変更を加える
```shell
❯ git switch -c alice
❯ sed -i '9a from alice' hello.txt
❯ sed -i '2a from alice' hello.txt
❯ git commit -am 'from alice'
```

mainブランチに戻ってコンフリクトするように変更を加える

```shell
❯ git switch main
❯ sed -i '7a from bob' hello.txt
❯ sed -i '2a from bob' hello.txt
❯ git commit -am 'from bob'
```

マージするとコンフリクトが発生するので、mergetoolを実行する

```shell
❯ git merge alice
Auto-merging hello.txt
CONFLICT (content): Merge conflict in hello.txt
Automatic merge failed; fix conflicts and then commit the result.

❯ git mergetool
```

![[Pasted-image-20240704020325.png]]

変更を適用するには、下画面(MERGED)で直接ファイルを編集するか、以下コマンドでどちらかを取り込む。

```
:diffg REM  # get from REMOTE
:diffg LOC  # get from LOCAL
```


## 参考

- [Neovim As Git Mergetool](https://smittie.de/posts/git-mergetool/)
- https://gist.github.com/karenyyng/f19ff75c60f18b4b8149/e6ae1d38fb83e05c4378d8e19b014fd8975abb39