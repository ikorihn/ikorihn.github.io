---
title: wezterm
date: "2022-08-20T22:21:00+09:00"
tags:
  - 'shell'
  - 'terminal'
---

## tab title, pane titleにcurrent pathを設定する

### OSC

<https://wezfurlong.org/wezterm/shell-integration.html> のページに `OSC 133` という単語が出てくる。

エスケープシーケンスで意味のあるマークを挿入して、コマンドの出力を一まとまりに扱うための仕様らしい。
[ZshでOSC 133に対応する](https://zenn.dev/ymotongpoo/articles/20220802-osc-133-zsh)
<https://gitlab.freedesktop.org/Per_Bothner/specifications/blob/master/proposals/semantic-prompts.md>

[ANSI escape sequences](https://en.wikipedia.org/wiki/ANSI_escape_code#Escape_sequences)  にはいくつかカテゴリが存在するらしい
よく色つけに使われる `\033[XXXm` というのもこれ

```shell
$ echo -en "\e[41mColor\e[mWhite"
```

`\033`, `\x1b`, `\e` などはどれもESCを表す
この `\e[` を CSI (Control Sequence Introducer) といい、 `\e]` は OSC (Operating System Command) という

これを踏まえて、 [[wezterm]] で変数を扱えるようにしたりタイトルを設定したりする

### 変数を設定する

<https://wezfurlong.org/wezterm/config/lua/pane/get_user_vars.html>

```shell
printf "\033]1337;SetUserVar=%s=%s\007" foo `echo -n bar | base64`
```

とすると、以下のようにして取得できる

```lua
wezterm.log_info('foo var is ' .. pane:get_user_vars().foo)
```

つまり OSC 1337 + `SetUserVar=key=value` + `\007` とすると `get_user_vars` で取得できる。

echoで書くとこうなる

```shell
echo "\x1b]1337;SetUserVar=key=$(echo -n value | base64)\x07"
```

### 現在いるディレクトリのgitリポジトリ名をtabのtitleに設定する

<https://wezfurlong.org/wezterm/config/lua/window-events/format-tab-title.html> で、変数 `panetitle` を取得して値があればそれをtabに設定する

`~/.config/wezterm/wezterm.lua`

```lua
wezterm.on("format-tab-title", function(tab, tabs, panes, config, hover, max_width)
	local title
	local user_title = tab.active_pane.user_vars.panetitle
	if user_title ~= nil and #user_title > 0 then
		title = tab.tab_index + 1 .. ":" .. user_title
	else
		title = tab.tab_index + 1 .. ":" .. tab.active_pane.current_working_dir
	end

	local solid_left_arrow = utf8.char(0x2590)
	local solid_right_arrow = utf8.char(0x258c)
	local edge_background = "#363636"
	local background = scheme.ansi[1]
	local foreground = scheme.ansi[5]

	if tab.is_active then
		background = scheme.brights[1]
		foreground = scheme.brights[8]
	elseif hover then
		background = scheme.cursor_bg
		foreground = scheme.cursor_fg
	end
	local edge_foreground = background

	return {
		{ Attribute = { Intensity = "Bold" } },
		{ Background = { Color = edge_background } },
		{ Foreground = { Color = edge_foreground } },
		{ Text = solid_left_arrow },
		{ Background = { Color = background } },
		{ Foreground = { Color = foreground } },
		{ Text = title },
		{ Background = { Color = edge_background } },
		{ Foreground = { Color = edge_foreground } },
		{ Text = solid_right_arrow },
		{ Attribute = { Intensity = "Normal" } },
	}
end)
```

- zshの `precmd` hookを登録して、コマンド実行のたびに `panetitle` を更新するようにする
- `vsc_info` も使用してgitのディレクトリ内にいるときはリポジトリ名をセットする

`~/.zshrc`

```shell
function rename_wezterm_title {
  echo "\e]1337;SetUserVar=panetitle=$(echo -n $1 | base64)\x07"
}

autoload -Uz add-zsh-hook
autoload -Uz vcs_info
zstyle ':vcs_info:*' enable git
zstyle ':vcs_info:*' formats '%r'
_precmd_wezterm () {
  if [[ $TERM_PROGRAM = WezTerm ]]; then
    vcs_info
    if [[ -n ${vcs_info_msg_0_} ]]; then
      rename_wezterm_title ${vcs_info_msg_0_}
    else
      rename_wezterm_title $(basename $(pwd))
    fi
  fi
}

add-zsh-hook precmd _precmd_wezterm
```

### pane titleを設定する

上記でtabのタイトルがセットできたが、tab一覧を表示したときにはpane titleが表示される。
pane titleはデフォルトでprocess名が入るので、どのtabなのかわかりにくい。

<https://wezfurlong.org/wezterm/config/lua/pane/get_title.html>

OSC 1 でセットすることができるので、先程同様 `precmd` でセットする

```shell
echo "\x1b]1;$(pwd)"
```

## 前回開いていたtabを復元する

[tmux-resurrect](https://github.com/tmux-plugins/tmux-resurrect), [tmux-continuum](https://github.com/tmux-plugins/tmux-continuum) のように、前回開いていたタブの一覧を復元したい。
`20220807-113146-c2fee766` 時点では、weztermにそのような機能はないため自分で保存、復元を行うようにする。

### 現在のタブ一覧を保存する

<https://wezfurlong.org/wezterm/cli/cli/list.html>
`wezterm cli list` で開いているtabの一覧を出力できる。
`--format=json` をつけるとJSONにできる。

この出力結果をどこかに保存する処理を定期実行すればよさそう。
今回はcronに設定することにした。

`crontab -e`

```shell
*/5 * * * * zsh -c "wezterm cli list --format=json > ~/.cache/wezterm/tabs.json"
```

### タブを復元する

こちらのような関数を用意した。(require: jq)

```shell
function restore_wezterm_tabs() {
  cat ~/.cache/wezterm/tabs.json | jq -r '.[] | .cwd' | sed "s#file://$(hostname)##i" | xargs -i wezterm cli spawn --cwd {}
}
```

`wezterm cli spawn --cwd <directory>` でディレクトリを指定してtabを開くことができるので、JSONに保存した各tabの情報から `cwd` の項目を拾って引数にする
