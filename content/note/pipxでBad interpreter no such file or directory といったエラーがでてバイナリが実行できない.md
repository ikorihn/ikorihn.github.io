---
title: pipxでBad interpreter no such file or directory といったエラーがでてバイナリが実行できない
date: 2024-03-08T11:50:00+09:00
tags:
  - Python
---

[[pipx]] でインストールしたバイナリ (https://github.com/localstack/aws-sam-cli-local) を実行しようとしたところ以下のようなエラーとなり実行できなかった。

```shell
zsh: /Users/USER/.local/bin/samlocal: bad interpreter: /Users/USER/Library/Application: no such file or directory
```

同じ症状のIssueがあった。
[Bad interpreter `/Users/USER/Library/Application: no such file or directory` on multiple commands · Issue #1226 · pypa/pipx](https://github.com/pypa/pipx/issues/1226)

## 原因

[$PIPX_HOME on macOS since release 1.3.0 breaks awscli · Issue #1198 · pypa/pipx](https://github.com/pypa/pipx/issues/1198)

実行ファイルパスにspaceが入っていると駄目ってやつ。

## pipxがバイナリをインストールするディレクトリを変更する

[[pipx]] のデフォルトのVirtual Environmentの場所は `~/Library/Application Support` となっているので、これをスペースを含まない場所に変えてあげるといい。

[公式](https://pipx.pypa.io/latest/troubleshooting/#macos-issues) には `$HOME/Library/ApplicationSupport` を作って `$HOME/Library/Application\ Support/pipx` を `$HOME/Library/ApplicationSupport/pipx` にリンクさせるとあるのだけど、このために余計なディレクトリ作るのって気持ちになった。

Linuxでは `~/.local/share/pipx` になっているので、macOSでも同じようにするため [PIPX_HOME](https://pipx.pypa.io/stable/docs/) を設定する。

```shell
export PIPX_HOME=~/.local/share/pipx
# XDG Base Directoryを設定しているなら以下
export PIPX_HOME=$XDG_DATA_HOME/pipx
```

これで `pipx install --force` でインストールし直したら動くようになった。