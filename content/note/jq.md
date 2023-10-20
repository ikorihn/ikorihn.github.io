---
title: jq
date: 2022-08-29T14:39:00+09:00
tags:
- jq
- shell
- json
---

## vimでjqコマンドを使いやすくする

````vimscript
" jq command
command! -nargs=? Jq call s:Jq(<f-args>)
function! s:Jq(...)
    if 0 == a:0
        let l:arg = "."
    else
        let l:arg = a:1
    endif
    execute "%! jq " . l:arg
endfunction
````

## 配列の長さを調べる

````shell
jq '.array[] | length'
````

## 配列に特定のキーを含まないものを検索する

<https://stackoverflow.com/questions/70369094/jq-output-is-empty-when-tag-name-does-not-exist>

次のようなAWS CLIの出力について考える

````json
{
  "Reservations": [
    {
      "Instances": [
        {
          "PrivateIpAddress": "10.0.0.1",
          "Tags": [
            {
              "Key": "Name",
              "Value": "Balance-OTA-SS_a"
            },
            {
              "Key": "Environment",
              "Value": "alpha"
            }
          ]
        }
      ]
    },
    {
      "Instances": [
        {
          "PrivateIpAddress": "10.0.0.2",
          "Tags": [
            {
              "Key": "Name",
              "Value": "Balance-OTA-SS_a"
            }
          ]
        }
      ]
    }
  ]
}
````

````shell
jq '.Reservations[].Instances[] | ({IP: .PrivateIpAddress, Ambiente: (.Tags[]|select(.Key=="Environment")|.Value)})'
````

とすると、TagsにEnvironmentを含むもののみ出力される。
これを、Environmentを含まないものはnullとして出力したいときは以下のようにする

````shell
jq '.Reservations[].Instances[] | { IP: .PrivateIpAddress, Ambiente: (.Tags|from_entries.Environment) }'

# または
jq '.Reservations[].Instances[] | { IP: .PrivateIpAddress, Ambiente: ((.Tags[] | select(.Key == "Environment") | .Value) // null) }'
````

`//` についてはこちらに書いてある
<https://stedolan.github.io/jq/manual/#ConditionalsandComparisons>

## エスケープ処理済みのJSON文字列を作成する

[jqを利用してエスケープ処理済みのJSON文字列を作成する方法 | DevelopersIO](https://dev.classmethod.jp/articles/how-to-create-an-escaped-json-string-using-jq/)

`jq '@json'`
