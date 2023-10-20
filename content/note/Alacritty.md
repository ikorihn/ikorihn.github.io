---
title: Alacritty
date: 2022-01-16T14:26:00+09:00
lastmod: 2022-01-16T15:40:00+09:00
tags:
- terminal
---

[Alacritty](https://github.com/alacritty/alacritty) はRust製の高速なターミナルエミュレータ。

* OpenGLでGPUレンダリングを用いて描画するためとても高速
* クロスプラットフォームに対応している
* 設定がすべて[YAML](note/YAML.md) (`~/.config/alacritty/alacritty.yml`) なため管理がしやすい
  * GUIがないため初心者には難しい
* スクロールバー、タブなどもない。[tmux](note/tmux.md) と組み合わせて使うのが前提となっていそう。

## インストール

<https://github.com/alacritty/alacritty/blob/master/INSTALL.md>

* [cargo](note/cargo.md) でインストールする
* macの場合 `brew install --cask alacritty`
* ソースコードからビルドする

[Homebrew](note/Homebrew.md) や [cargo](note/cargo.md) でインストールする場合、 terminfo やdesktop entry、manual page、シェル補完が利用できないが、
Rustの環境を構築せず（cargoを利用する場合は必要）、簡単にAlacrittyをインストールできる。

最新を使いたいので、ソースコードからビルドする([Rust](note/Rust.md) を事前にインストールしておく)

````bash
git clone https://github.com/jwilm/alacritty.git
cd alacritty
make app
cp -r target/release/osx/Alacritty.app /Applications/
````

## 日本語のインライン入力ができない

日本語入力に難点がある

* 変換確定前の段階だとターミナル上に字が出てこない
* 変換の際に矢印キーで選択したりbackspaceを押すと、ターミナル側の操作(ヒストリーバック、文字削除など)になってしまう

こちらの方が直してくれて、マージされているのでおそらく0.10.0で解消されている。
[Alacrittyが日本語入力がおかしいのを直した](https://komi.dev/post/2021-07-20-enabling-ime-in-alacritty/)

…と思ったら中国語の入力でデグレがあったため戻っていた。逆にいうと中国語圏の人の問題が解消されれば日本語も直るのかな…？
<https://github.com/rust-windowing/winit/pull/2119>

## 設定

### テーマ

<https://github.com/eendroroy/alacritty-theme> にテーマがまとまっている。

`git clone https://github.com/eendroroy/alacritty-theme.git` して、 `alacritty.yml` に以下を設定する

````yml
import:
  - /path/to/alacritty-theme/themes/<テーマ>.yml
````

### [True color](note/True%20color.md) を有効にする

有効になっているか確認
[iTerm2のテスト用コード](https://github.com/gnachman/iTerm2/blob/master/tests/24-bit-color.sh) で確認できる

````bash
curl -s https://github.com/gnachman/iTerm2/blob/master/tests/24-bit-color.sh
````

色がなめらかにグラデーション表示されていればOK。
段差が明らかに見て取れる場合は対応されていない。

Alacrittyでtmux, NeovimのTrue colorを有効にするためには、それぞれ以下の設定が必要

<https://github.com/alacritty/alacritty/issues/109>

````yml:$HOME/.config/alacritty/alacritty.yml
env:
  TERM: alacritty
````

````conf:$HOME/.tmux.conf
set -g default-terminal "screen-256color"
set-option -sa terminal-overrides ',alacritty:RGB'
````

````vim:$HOME/.config/nvim/init.vim
set termguicolors
````

### 

````yml:$HOME/.config/alacritty/alacritty.yml
# テーマ
import:
  - ~/.config/alacritty/alacritty-theme/themes/gruvbox_material.yml
  
env:
  TERM: alacritty

window:
  dimensions:
    # Alacrittyを開いたときのウィンドウサイズ
    columns: 140
    lines: 40
  padding:
    # Macだと角が丸くて見切れるため余白を入れる
    x: 8
    y: 4
font:
  normal:
    family: "HackGenNerd Console"
    style: Regular
  bold:
    family: "HackGenNerd Console"
    style: Bold
    family: "HackGenNerd Console"
    style: Italic
    family: "HackGenNerd Console"
    style: Bold Italic
  size: 16.0
  
shell:
  # 起動時にtmuxを開く(セッションがすでにあればアタッチする)
  program: zsh
  args:
    - -c
    - "tmux a -t 0 || tmux"

key_bindings:
  # modifierを使ったキーバインドがAlacrittyに奪われるため、もとのキーバインドで上書きする
  - { key: Q, mods: Control, chars: "\x11" }
  - { key: Space, mods: Control, chars: "\x00" }
  - { key: A, mods: Alt, chars: "\x1ba" }
  - { key: B, mods: Alt, chars: "\x1bb" }
  - { key: C, mods: Alt, chars: "\x1bc" }
  - { key: D, mods: Alt, chars: "\x1bd" }
  - { key: E, mods: Alt, chars: "\x1be" }
  - { key: F, mods: Alt, chars: "\x1bf" }
  - { key: G, mods: Alt, chars: "\x1bg" }
  - { key: H, mods: Alt, chars: "\x1bh" }
  - { key: I, mods: Alt, chars: "\x1bi" }
  - { key: J, mods: Alt, chars: "\x1bj" }
  - { key: K, mods: Alt, chars: "\x1bk" }
  - { key: L, mods: Alt, chars: "\x1bl" }
  - { key: M, mods: Alt, chars: "\x1bm" }
  - { key: N, mods: Alt, chars: "\x1bn" }
  - { key: O, mods: Alt, chars: "\x1bo" }
  - { key: P, mods: Alt, chars: "\x1bp" }
  - { key: Q, mods: Alt, chars: "\x1bq" }
  - { key: R, mods: Alt, chars: "\x1br" }
  - { key: S, mods: Alt, chars: "\x1bs" }
  - { key: T, mods: Alt, chars: "\x1bt" }
  - { key: U, mods: Alt, chars: "\x1bu" }
  - { key: V, mods: Alt, chars: "\x1bv" }
  - { key: W, mods: Alt, chars: "\x1bw" }
  - { key: X, mods: Alt, chars: "\x1bx" }
  - { key: Y, mods: Alt, chars: "\x1by" }
  - { key: Z, mods: Alt, chars: "\x1bz" }

````
