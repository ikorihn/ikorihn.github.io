---
title: shell ランダム文字列を生成するワンライナー
date: '2021-07-29T18:24:00+09:00'
tags:
  - 'shell'
---

固定文字列を付与したい場合はawkなどでつければよい

```shell
$ cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 10 | awk '{ print "prefix:" $1 }'

prefix:0dCIkKBOq8bcM4yCP0Su5AE0yb6OUBtJ
prefix:ferc9H8Qx0QvaK3klwAiMGejgWVDycL0
prefix:pYJGcHzrxYtlT8p4dw8JT567XmeljRRq
prefix:dJ1g2vryv1U2EmE0fW4bOT8DlW2plXQx
prefix:W952QQrK0XFG1hyUzh4vy1D6vWAU2Xt9
prefix:IEXRe5sAhmnYenIhMse2C63qYZSpmlTY
prefix:IaMWJGHRqhQXj8RhqsOJtT8OAYAoPvPY
prefix:h89cSAk63KSTCa3J880qYmjpoRFHi3DJ
prefix:MUEAglVmFbIwCdRzBllDcPIQzIjN0ivu
prefix:7sNNrE29j5QaHk1h3zuAaeqSXftzWcn3
```

## 仕組み

- `/dev/urandom` でランダム文字列を生成
- `tr -dc 'a-zA-Z0-9'`: 英数字以外を削除
  - `-d`: <文字セット>に含まれる文字があったら削除する
  - `-c`: <文字セット>に含まれない文字全て（の補集合）を対象とする
- `fold`: テキストを指定した幅で改行する
