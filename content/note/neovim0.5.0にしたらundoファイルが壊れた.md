---
title: neovim0.5.0にしたらundoファイルが壊れた
date: "2021-08-06T16:00:00+09:00"
tags: 
    - 'vim'
---


brewでインストールされるNeovimのバージョンが0.5.0になった。

ファイルを開くと、 `E824: Incompatible undo file: /path/to/undo` というメッセージが出るようになって、過去にさかのぼってのundoができなくなった


## 対応

https://www.reddit.com/r/neovim/comments/lxu7p3/error_incompatible_undo_file_whenever_i_open_a/

[[Vim]] や0.5.0より前の[[Neovim]] との互換性がなくなったため、諦めるしか無い
