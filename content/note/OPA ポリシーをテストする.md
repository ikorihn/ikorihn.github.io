---
title: OPA ポリシーをテストする
date: '2023-04-27T09:30:00+09:00'
tags:
  - '2023/04/27'
  - 'OPA'
---

[[Open Policy Agent OPA]] でポリシーをテストする

https://www.openpolicyagent.org/docs/latest/policy-testing/#getting-started

`example.go`

```rego
package mypolicy

allow {
    input.name == "Alice"
}
```

`*_test.rego` という名前で作り、テストケースを `test_*` で作る

`example_test.go`

```rego
package mypolicy

test_allow_success {
    allow with input as {"name": "Alice"}
}

test_not_allowed {
    not allow with input as {"name": "Bob"}
}
```
