---
title: zshの起動が遅いのを解消した
date: "2022-07-21T15:13:00+09:00"
tags:
  - 'zsh'
---

[[zsh Zinitに変える]] をしたけど遅くなってきたので調査した

## 調査方法

[〇〇envのせいでzshの起動が遅いからチューニングした - Qiita](https://qiita.com/Suzuki09/items/6c27a8a875cf94d981a4)

起動速度の計測

```shell
time (zsh -i -c exit)
```

[zshとNeovimの簡単な起動速度の測定方法](https://zenn.dev/yutakatay/articles/zsh-neovim-speedcheck)

zprofを使ってどの処理に時間かかっているかを測定

```shell:.zshrc
if [ "$ZSHRC_PROFILE" != "" ]; then
  zmodload zsh/zprof && zprof > /dev/null
fi

function zsh-profiler() {
  ZSHRC_PROFILE=1 zsh -i -c zprof
}
```

[zshの起動を高速化した - memo/note/blog](https://note.youyo.io/post/speed-up-zsh-startup/)

コメントアウトしながらどれが遅いかを調査

## やったこと

### compinitを1回だけ実行するようにした

複数回実行している箇所があったので直した

### `brew --prefix` コマンドを1回だけ実行するようにした

brewで入れたコマンドにpathを通すために、毎回 `$(brew --prefix)` でbrewのディレクトリを取得していたが、これが結構時間がかかっていた。

```shell
path=(
    $(brew --prefix)/opt/coreutils/libexec/gnubin(N-/) # coreutils
    $(brew --prefix)/opt/ed/libexec/gnubin(N-/) # ed
    $(brew --prefix)/opt/findutils/libexec/gnubin(N-/) # findutils
    $(brew --prefix)/opt/gnu-sed/libexec/gnubin(N-/) # sed
    $(brew --prefix)/opt/gnu-tar/libexec/gnubin(N-/) # tar
    $(brew --prefix)/opt/grep/libexec/gnubin(N-/) # grep
    ${path}
)
manpath=(
    $(brew --prefix)/opt/coreutils/libexec/gnuman(N-/) # coreutils
    $(brew --prefix)/opt/ed/libexec/gnuman(N-/) # ed
    $(brew --prefix)/opt/findutils/libexec/gnuman(N-/) # findutils
    $(brew --prefix)/opt/gnu-sed/libexec/gnuman(N-/) # sed
    $(brew --prefix)/opt/gnu-tar/libexec/gnuman(N-/) # tar
    $(brew --prefix)/opt/grep/libexec/gnuman(N-/) # grep
    ${manpath}
)
```

↓

```shell
export BREW_PREFIX=$(brew --prefix)
path=(
    $BREW_PREFIX/opt/coreutils/libexec/gnubin(N-/) # coreutils
    $BREW_PREFIX/opt/ed/libexec/gnubin(N-/) # ed
    $BREW_PREFIX/opt/findutils/libexec/gnubin(N-/) # findutils
    $BREW_PREFIX/opt/gnu-sed/libexec/gnubin(N-/) # sed
    $BREW_PREFIX/opt/gnu-tar/libexec/gnubin(N-/) # tar
    $BREW_PREFIX/opt/grep/libexec/gnubin(N-/) # grep
    $BREW_PREFIX/opt/mysql-client/bin(N-/) # mysql
    ${path}
)
manpath=(
    $BREW_PREFIX/opt/coreutils/libexec/gnuman(N-/) # coreutils
    $BREW_PREFIX/opt/ed/libexec/gnuman(N-/) # ed
    $BREW_PREFIX/opt/findutils/libexec/gnuman(N-/) # findutils
    $BREW_PREFIX/opt/gnu-sed/libexec/gnuman(N-/) # sed
    $BREW_PREFIX/opt/gnu-tar/libexec/gnuman(N-/) # tar
    $BREW_PREFIX/opt/grep/libexec/gnuman(N-/) # grep
    ${manpath}
)
```

### zinit -> sheldon に移行した

パッケージマネージャはもともと [zplug](https://github.com/zplug/zplug) を使っていて、1年くらい前に [zinit](https://github.com/zdharma-continuum/zinit) に移行したが、あるとき作者さんがリポジトリを削除して、現在あるのはfork版となっている。
メンテナンスに不安を感じたのと、設定が難しいなと感じていたので [sheldon](https://github.com/rossmacarthur/sheldon) に移行した。

`.zshrc`

```shell
# zshrcにはこれだけ
eval "$(sheldon source)"
```

`~/.config/sheldon/plugins.toml`

```toml
shell = "zsh"

# zsh-deferを使って、デフォルトで遅延読み込みする
apply = ["defer"]
[plugins.zsh-defer]
github = "romkatv/zsh-defer"
apply = ["source"]
[templates]
defer = { value = 'zsh-defer source "{{ file }}"', each = true }

[plugins.compinit]
inline = 'autoload -Uz compinit && compinit'

[plugins.fast-syntax-highlighting]
github = "zdharma-continuum/fast-syntax-highlighting"
[plugins.zsh-completions]
github = "zsh-users/zsh-completions"
[plugins.zsh-autosuggestions]
github = "zsh-users/zsh-autosuggestions"
[plugins.zsh-history-substring-search]
github = "zsh-users/zsh-history-substring-search"

# remoteのshellを実行する
[plugins.aws_zsh_completer]
remote = "https://raw.githubusercontent.com/aws/aws-cli/v2/bin/aws_zsh_completer.sh"

[plugins.dotfiles-defer]
local = "~/.config/zsh"
use = ["{functions}.zsh"]

# 同期的に読み込みたいものは source を指定する
[plugins.dotfiles-sync]
local = "~/.config/zsh"
use = ["{options,plugins}.zsh"]
apply = ["source"]
```

これにより、ほとんどの設定やプラグインを非同期で読み込むようになり起動時には時間があまりかからなくなった。

## 結果

- もともと1.4sかかっていたのが、`brew --prefix` の改善で500msまで早くなった
- zinit -> sheldon移行で200msまで早くなった
