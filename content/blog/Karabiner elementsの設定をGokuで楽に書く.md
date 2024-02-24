---
title: Karabiner elementsの設定をGokuで楽に書く
date: "2023-08-25T11:37:00+09:00"
tags:
  - '2023/08/25'
  - karabiner
  - keyboard
---

[[Karabiner Elements]] は大変便利なアプリケーションですが、GUIだけだと設定に限界があるのである程度慣れてくるとJSONを直接編集することになります。
このJSONの編集がなかなか面倒で、肥大化してくると見通しも悪くなってきます。

そこで[Goku](https://github.com/yqrashawn/GokuRakuJoudo) を使うと見やすい設定ファイルをかけるようになります。

## ドキュメント、参考リンク

- examples: https://github.com/yqrashawn/GokuRakuJoudo/blob/master/examples.org#profiles-wip
- tutorial: https://github.com/yqrashawn/GokuRakuJoudo/blob/master/tutorial.md#basic8
- key names: https://github.com/yqrashawn/GokuRakuJoudo/blob/master/src/karabiner_configurator/keys_info.clj

- 各構文の説明が詳細にされていてわかりやすいednファイル(by Kaushik Gopal): https://gist.github.com/kaushikgopal/ff7a92bbc887e59699c804b59074a126
- Authorのednファイル https://github.com/yqrashawn/yqdotfiles/blob/master/modules/yqrashawn/home-manager/dotfiles/karabiner.edn

## 基本的な書き方

GokuはClojure製のツールで、[edn format](https://github.com/edn-format/edn) で記述します。
わたしは見たことがないフォーマットだったのですが、Clojureで使われることが多いのかな…？

左のctrlを単押ししたときにESC、他のキーと組み合わせたときにはcontrolを送信するルールを書いてみます。

Gokuの場合

```edn
:main [
    {
        :des "Post escape if left_control is pressed alone."
        :rules [
            [:##left_control :left_control nil {:alone :escape}]
        ]
    }
]
```

JSONの場合

```json
{
    "description": "Post escape if left_control is pressed alone.",
    "manipulators": [
        {
            "from": {
                "key_code": "left_control",
                "modifiers": {
                    "optional": [
                        "any"
                    ]
                }
            },
            "to": [
                {
                    "key_code": "left_control"
                }
            ],
            "to_if_alone": [
                {
                    "key_code": "escape"
                }
            ],
            "type": "basic"
        }
    ]
}
```

記法を覚える必要はあるものの、記述量がぐっと減って、やりたいことも明確になっています。

記法はチュートリアルやexampleを見るのもいいですが、こちらのgistによくまとまっていてわかりやすいです。
https://gist.github.com/kaushikgopal/ff7a92bbc887e59699c804b59074a126

### Layer

キー数の少ないキーボードにあるような、layerを定義することができます。

```edn
; モード切替のキーを何ミリ秒までモード切替として判定するか
:simlayer-threshold 400
:simlayers {
    ; oをlaunch-modeに移行するキーとする
    :launch-mode { :key :o }
}
:templates {
    ; テンプレート
    :open-app "open -a \"%s\""
}
:main [
    {
        :des "launch mode: quick launch applications"
        :rules [
            :launch-mode
                ; oとtを同時に押すと open -a \"Alacritty\" を実行する
                [:t [:open-app "Alacritty"]]
                [:f [:open-app "Finder"]]
        ]
    }
]
```

これは以下のように展開されます。
一定時間内に2つのキーを同時押しすると発動するという設定になっています。
これを自分で書こうとするとこれだけの量書かないといけないため、いかに楽になっているかがわかります。

```json
{
    "description": "launch mode: quick launch applications",
    "manipulators": [
        {
            "conditions": [
                {
                    "name": "launch-mode",
                    "type": "variable_if",
                    "value": 1
                }
            ],
            "from": {
                "key_code": "t"
            },
            "to": [
                {
                    "shell_command": "open -a \"Alacritty\""
                }
            ],
            "type": "basic"
        },
        {
            "from": {
                "simultaneous": [
                    {
                        "key_code": "o"
                    },
                    {
                        "key_code": "t"
                    }
                ],
                "simultaneous_options": {
                    "detect_key_down_uninterruptedly": true,
                    "key_down_order": "strict",
                    "key_up_order": "strict_inverse",
                    "key_up_when": "any",
                    "to_after_key_up": [
                        {
                            "set_variable": {
                                "name": "launch-mode",
                                "value": 0
                            }
                        }
                    ]
                }
            },
            "parameters": {
                "basic.simultaneous_threshold_milliseconds": 400
            },
            "to": [
                {
                    "set_variable": {
                        "name": "launch-mode",
                        "value": 1
                    }
                },
                {
                    "shell_command": "open -a \"Alacritty\""
                }
            ],
            "type": "basic"
        },
        {
            "conditions": [
                {
                    "name": "launch-mode",
                    "type": "variable_if",
                    "value": 1
                }
            ],
            "from": {
                "key_code": "f"
            },
            "to": [
                {
                    "shell_command": "open -a \"Finder\""
                }
            ],
            "type": "basic"
        },
        {
            "from": {
                "simultaneous": [
                    {
                        "key_code": "o"
                    },
                    {
                        "key_code": "f"
                    }
                ],
                "simultaneous_options": {
                    "detect_key_down_uninterruptedly": true,
                    "key_down_order": "strict",
                    "key_up_order": "strict_inverse",
                    "key_up_when": "any",
                    "to_after_key_up": [
                        {
                            "set_variable": {
                                "name": "launch-mode",
                                "value": 0
                            }
                        }
                    ]
                }
            },
            "parameters": {
                "basic.simultaneous_threshold_milliseconds": 400
            },
            "to": [
                {
                    "set_variable": {
                        "name": "launch-mode",
                        "value": 1
                    }
                },
                {
                    "shell_command": "open -a \"Finder\""
                }
            ],
            "type": "basic"
        }
    ]
}
```


## karabiner.jsonへの反映

ednで書いた設定値は、そのままではKarabinerが読み込めないため、karabiner.jsonに反映させる必要があります。
それをするのが `goku` コマンドで、 `goku` を実行するとデフォルトでは `~/.config/karabiner.edn` を読み込み `~/.config/karabiner/karabiner.json` を上書きします。

### ednファイルのパスを指定する

環境変数 `GOKU_EDN_CONFIG_FILE` によって指定することができます。
`export GOKU_EDN_CONFIG_FILE=$HOME/.config/karabiner/karabiner.edn` としてから `goku` を実行すると指定したファイルが読み込まれます。

### jqでフォーマットしてからkarabiner.jsonに反映させる

バージョン管理の都合上、フォーマット差分が多いと面倒なのでjqできれいにしてから反映させたいと思います。

```shell
export GOKU_EDN_CONFIG_FILE=$XDG_CONFIG_HOME/karabiner/karabiner.edn
goku -A | jq --sort-keys --indent 4 '.' > /tmp/karabiner.tmp.json && mv /tmp/karabiner.tmp.json $XDG_CONFIG_HOME/karabiner/karabiner.json
```

## Examples

私の設定の一部を紹介して終わりたいと思います。

### SandS (スペースを他のキーと一緒に押すとshift、単押しでスペース)

```edn
main [
    {
        :des "Change spacebar to left_shift. (Post spacebar if pressed alone)"
        :rules [
            [:spacebar :left_shift nil {:alone :spacebar :held :repeat_space :params {:held 800}}]
        ]
    }
]
```

### 左ctrlを単押ししたときにESCにする

```edn
main [
    {
        :des "Post escape if left_control is pressed alone."
        :rules [
            [:##left_control :left_control nil {:alone :escape}]
        ]
    }
]
```

### キーボードごとに異なる設定をする

Gokuにはsimple_modificationを直接設定する項目がないので、キーボードごとにルールを作成することで代替する。

```edn
:devices {
    :apple-us [{:vendor_id 1452 :product_id 641}]
    :hhkb-bt [{:vendor_id 1278 :product_id 514}]
    :barocco [{:vendor_id 1241 }]

    :all-kybs [  ;; all keyboards
        {:vendor_id 1452}
        {:vendor_id 1278}
        {:vendor_id 1241}
    ]
}

main [
    {
        :des "simple_modification"
        :rules [
            :all-kybs
                [:##escape :##grave_accent_and_tilde]
            :hhkb-bt
                [:grave_accent_and_tilde :delete_or_backspace]
                [:right_option :caps_lock]
            :apple-us
                [:caps_lock :left_control nil {:alone :escape}]
                [:left_control :left_option]
                [:right_option :caps_lock]
                [:right_shift :fn]
        ]
    }
]
```

### 左commandキーを1回押すと英数、2回押すとかな、他のキーと組み合わせるときは通常のcommandキーにする

```edn
main [
    {
        :des "Press left command once to japanese_eisuu, twice to japanese_kana."
        :rules [
            [:left_command [:japanese_kana ["left-command-pressed-once" 0]] ["left-command-pressed-once" 1]]
            [:left_command :lazy_left_command ["left-command-pressed-once" 0] {:alone [:japanese_eisuu ["left-command-pressed-once" 1]] :delayed {:invoked ["left-command-pressed-once" 0] :canceled ["left-command-pressed-once" 0]}}]
        ]
    }
]
```

### f + hjkl を矢印にする

```edn
:simlayers {
    :arrow-mode { :key :f :modi {:optional [:any]}}
}
main [
    {
        :des "f to arrow mode"
        :rules [
            :arrow-mode
                [:##h :##left_arrow]
                [:##j :##down_arrow]
                [:##k :##up_arrow]
                [:##l :##right_arrow]
        ]
    }
]
```
