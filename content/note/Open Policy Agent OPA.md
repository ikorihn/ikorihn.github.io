---
title: Open Policy Agent OPA
date: "2023-03-27T10:49:00+09:00"
tags:
  - '2023/03/27'
  - 'Kubernetes'
---

GateKeeper, Conftestと組み合わせて使う

https://www.openpolicyagent.org/docs/latest/policy-language/
[Playground](https://play.openpolicyagent.org) もある

わかりやすいページ
[Policy as Codeを実現する Open Policy Agent / Rego の紹介 - ISID テックブログ](https://tech.isid.co.jp/entry/2021/12/05/Policy_as_Code%E3%82%92%E5%AE%9F%E7%8F%BE%E3%81%99%E3%82%8B_Open_Policy_Agent_/_Rego_%E3%81%AE%E7%B4%B9%E4%BB%8B)

Open Policy Agent (OPA)は、ポリシーベースのアクセス制御を提供するオープンソースのツールです。OPAは、REST APIやgRPCなどの形式でアプリケーションに統合され、アクセス制御の判断を行います。
OPAは、自由なポリシーの表現力を持ち、柔軟で拡張性の高い設計が特徴です。OPAのポリシーは、Regoという言語で記述されます。Regoは、JSONを基にしたデータ構造を扱いやすい形式で表現することができ、複雑なポリシーの表現が可能です。
様々なサービスのポリシー設定を同じ言語（Rego）で表現することができます。


Gatekeeper は、KubernetesにおけるOPAの実装の1つで、Kubernetesのポリシー管理を自動化するためのコントローラです。Gatekeeperは、OPAを使用して、Kubernetesのリソースやマニフェストを検証し、ポリシーに従わない場合は拒否することができます。

Conftestは、OPAのツールの1つで、設定ファイルやマニフェストなどの構成ファイルの検証を行うことができます。Conftestは、OPAの言語であるRegoを使用して、構成ファイルに対するポリシーを記述します。


## 書き方

```lua
package example

deny {
    input.user == "admin"
}
```

`input` は、Rego言語で用意されている予約語の一つで、アクセス制御の評価時に与えられる入力オブジェクトを表します。入力オブジェクトの構文は決まっておらず、アプリケーションによって異なります。つまり、`input`オブジェクトは、アプリケーションの入力に応じて、動的に構築されることが多いです。

このルールは、`input.user` が"admin"である場合に、`deny`を返します。このルールを実行するためには、`input`オブジェクトが与えられる必要があります。例えば、以下のような入力を与えることができます。

```json
{
    "user": "admin",
    "resource": "some-resource"
}
```

OPAの言語仕様において、`deny`や`allow`は予約語ではなく、ルールの名前として使用されます。これらのルール名には、アクセス制御の判断を行うために、`deny`と`allow`が一般的に使用されますが、任意の名前を付けることができます。

```lua
package example

allow {
    input.user == "admin"
}
```

```lua
package example

deny_my_rule {
    input.user == "admin"
}
```

Conftestでは、アサーションの結果を`deny`や`allow`で表現することができますが、これらはOPAのルールの名前として定義されているわけではなく、便宜的に使われているものです。Conftestは、Regoの言語仕様に基づいてルールを記述するため、`deny`や`allow`の他にも任意のルール名を使用することができます。ただし、アサーションの結果を`deny`や`allow`で表現することが一般的であり、よりわかりやすいコードを書くことができます。


## OR条件

Conftestで `||` みたいにOR条件を書けないか調べたが、簡単にできなかった。
同名の関数を複数用意することで、OR条件とできるらしい

```

deny[msg] {
    inRange(input.index)
    msg := sprintf("indexは1~99の範囲を指定する %v", [input.index])
}

inRange(v) {
    v >= 1
}
inRange(v) {
    v < 100
}
```
