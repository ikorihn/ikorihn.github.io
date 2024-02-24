---
title: pver_with_cobra
date: "2020-09-26T16:02:00+09:00"
tags:
  - Go
lastmod: '2021-05-30T18:09:57+09:00'

---

# pver_with_cobra

-   cobra init
-   cobra add
-   new関数でコマンドを初期化
    -   DIのためと思ってそうしたけど、後でroot.go内で初期化するようにしたので必要なかった
    -   rootコマンドはテストしづらくなるが、rootには機能もたせないのがよさそう
-   testを追加
    -   `cmd.SetOut` でbufferに出力させる
-   cmdパッケージは入出力、serviceパッケージはビジネスロジック、infraパッケージはAPI,DBみたいにわけた
    -   テストは書きやすくなった気がする
-   ダックタイピングがちょっとわかった
    -   service層にはinterfaceをもたせてinfra層で実装することで依存関係逆転させた
-   デバッグ目的以外でcmd層以外では出力しない
-
