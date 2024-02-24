---
title: fishのhistoryをzshに変換
date: "2021-05-13T10:51:00+09:00"
tags:
  - 'fish'
  - 'zsh'
lastmod: '2021-05-13T10:51:37+09:00'

---

#fish #zsh

<https://github.com/jverhoelen/fish-history-to-zsh>

```sh
git clone git@github.com:jverhoelen/fish-history-to-zsh.git
cd fish-history-to-zsh
node index.js
```


## fishのhistoryファイル

~/.local/share/fish/fish_history
yamlで保存されているので、yamlをロードして変換している

parseエラーが発生したので、fish_historyファイルから該当の行を消した。
数が少なかったのでこれで問題なかった

## zshのhistoryファイル

~/.zsh_history
