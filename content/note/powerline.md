---
title: powerline
date: "2020-09-22T18:46:00+09:00"
tags:
  - terminal
lastmod: '2021-05-30T18:09:26+09:00'

---

# powerline

-   powerlineをインストール
    -   pipでインストールする
    -   <https://powerline.readthedocs.io/en/master/installation.html#pip-installation>
-   font
    -   powerline対応のフォントでないとうまく表示されない
    -   Nerd fonts, Cicaなど
-   tmux

    -   次のようにする

    <!---->

        run-shell "powerline-daemon -q"
        source-file "path/to/powerline/bindings/tmux/powerline.conf"

## problem

### tmux + fishで現在のパスをpaneに表示できない

[[fishプラグイン]]

-   tmux実行時のpathが表示されてしまう
-   <https://github.com/tmux/tmux/issues/1889>
    -   解決してない
