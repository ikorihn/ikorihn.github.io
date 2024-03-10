{{< card-link "https://python-poetry.org" >}}

比較的新しいのの [[Python]] のパッケージマネージャ

- `pyproject.toml` にはプロジェクトの設定や利用したいライブラリとそのバージョンを書くファイル
- `poetry.lock` は自動で生成される、依存関係のライブラリ全体のバージョンをロックするファイル

## インストール

[[pipx]] を使う方法が紹介されている。
他にもmacOSであれば [[Homebrew]] など。

## ライブラリの追加

```shell
$ poetry add boto3
```

- `pyproject.toml`, `poetry.lock` が更新される
- venvがなければ、自動で作成する

## ライブラリの削除

```shell
$ poetry remove boto3
```

## pluginを利用する

https://python-poetry.org/docs/plugins#using-plugins

Poetryの機能拡張をユーザーが行える

```shell
$ poetry self add <some-plugin>

## pipxでpoetryをインストールしていれば下記でも可能
$ pipx inject poetry <some-plugin>
```

## 設定ファイルの場所

https://python-poetry.org/docs/configuration

- macOS: `~/Library/Application Support/pypoetry/config.toml`
- Windows: `%APPDATA%\pypoetry/config.toml`

## venvの作成場所

https://python-poetry.org/docs/configuration/

デフォルトでは `{cache-dir}/virtualenvs` に作成される。
`{cache-dir}` はデフォルトでは以下

- macOS: `~/Library/Caches/pypoetry`
- Windows: `C:\Users\<username>\AppData\Local\pypoetry\Cache`
- Unix: `~/.cache/pypoetry`


下記の設定を入れることで、カレントディレクトリ配下にvenvを作ってくれる

```
$ poetry config virtualenvs.in-project true
```
