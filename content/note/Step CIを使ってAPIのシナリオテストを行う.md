---
title: Step CIを使ってAPIのシナリオテストを行う
date: 2024-01-18T11:30:00+09:00
tags:
  - testing
  - CICD
---

{{< card-link "https://stepci.com" >}}

APIのテストを簡単にできるツール。
ユニットテストは実行が早くていいのだが、APIレベルでテストがあるとやはり安心感が違う。
[[Playwright]] でフロントエンド含めたE2Eテストができるが、ブラウザの動作を検証するのでメモリを食うし時間もかかる。

ビジネスロジックを検証する場合バックエンドだけテストできれば十分なので試してみた。

- シナリオテストの実行ができる
- ログインしたり、POSTして生成されたIDなどの情報を後続のテストで引き回したいケースにも対応している
- [[OpenAPI]] の定義からテストケースを作成できる

手順はこちら
https://docs.stepci.com/guides/getting-started.html

### インストール

```shell
npm install -g stepci
```

[[Homebrew|brew]] でも可

### ワークフロー

`workflow.yaml`

```yaml
version: "1.1"
name: My Workflow
env:
  host: jsonplaceholder.typicode.com
  resource: posts
tests:
  example:
    name: Example test
    steps:
      - name: Example step
        http:
          url: https://${{env.host}}/${{env.resource}}
          method: POST
          headers:
            Content-Type: application/json
          json:
            title: Hello Step CI!
            body: This is the body
            userId: 1
      - name: With Auth
        http:
          url: https://httpbin.org/basic-auth/hello/world
          method: GET
          auth:
            basic:
              username: hello
              password: world
```

> [!INFO] INFO
> JSONでもよい

### 実行

```shell
❯ stepci run workflow.yaml

ⓘ  Anonymous usage data collected. Learn more on https://step.ci/privacy

 PASS  Example test ⏲ 1.516s ⬆ 0 bytes ⬇ 0 bytes

Tests: 0 failed, 1 passed, 1 total
Steps: 0 failed, 0 skipped, 2 passed, 2 total
Time:  1.542s, estimated 2s
CO2:   0.00005g

Workflow passed after 1.542s
Give us your feedback on https://step.ci/feedback

```
