---
title: XDG_BASE_DIRECTORY
date: 2023-12-25T13:34:00+09:00
lastmod: '2023-12-25T13:51:47+09:00'
---

[XDG Base Directory - ArchWiki](https://wiki.archlinux.jp/index.php/XDG_Base_Directory)

設定ファイルやデータの保存場所を定めたもの。
アプリケーションごとにHOME直下にドットファイルを作ったり独自のパスに保存したりすると煩雑になってしまうので、標準的な仕様を設けて一貫した規則でファイルを配置しようというもの。

| 環境変数        | デフォルト値       | 説明                                                         |
| --------------- | ------------------ | ------------------------------------------------------------ |
| XDG_CONFIG_HOME | $HOME/.config      | 設定ファイル                                                 |
| XDG_CACHE_HOME  | $HOME/.cache       | 重要でない (キャッシュ) データ                               |
| XDG_DATA_HOME   | $HOME/.local/share | データファイル                                               |
| XDG_STATE_HOME  | $HOME/.local/state | 状態ファイル                                                 |
| XDG_RUNTIME_DIR |                    | ソケットや名前付きパイプなどのような必須でないデータファイル |
