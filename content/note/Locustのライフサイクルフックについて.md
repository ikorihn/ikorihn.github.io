---
title: Locustのライフサイクルフックについて
date: 2023-12-14T11:04:00+09:00
tags:
  - Locust
  - Python
---

[[Locust]] のスクリプトで、各イベントをフックにリスナーを登録することができる。
https://docs.locust.io/en/stable/extending-locust.html

より詳しくはこちら
https://docs.locust.io/en/stable/api.html#event-hooks

`headless` や `autostart` 、Web UIで実行した場合のどれでも同じようなタイミングで実行される

```python
# Locust起動直後に実行される処理
@events.init.add_listener
def locust_on_init(environment: Environment, runner: locust_runners.Runner, **kwargs):
    logging.info("locust init event received")

# 負荷試験開始時に実行される処理
@events.test_start.add_listener
def locust_on_test_start(environment: Environment, **kwargs):
    logging.info("locust test_start event received")

# 負荷試験終了時に実行される処理
@events.test_stop.add_listener
def locust_on_test_stop(environment: Environment, **kwargs):
    logging.info("locust test_stop event received")

# Locustプロセス終了直前に実行される処理
@events.quitting.add_listener
def locust_on_quitting(environment: Environment, **kwargs):
    logging.info("locust quitting event received")

```

## 自動実行時にtest_startイベントに時間のかかる処理を登録するときの注意

[[Locust 自動実行する]] のようにして `--run-time` を指定しているのにその時間実行されなかったり、もっと悪いことに実行が終了しないことがあった。

```python
@events.test_start.add_listener
def locust_on_test_start(environment: Environment, **kwargs):
    logging.info("locust test_start event received")
    # 時間のかかる処理
    time.sleep(30)
```

調査したところ `test_start` イベントで時間のかかる処理を実行していた。
この中の処理も `run-time` の実行時間に含まれるため、その分負荷試験の実行時間が減っていた。
さらに、`test_start` が `run-time` の時間を過ぎると、負荷試験を終了する処理はすでに呼ばれたことになっていてもう呼ばれない。その上で `test_start` が終わったタイミングで負荷試験が開始してしまうので終了しない。負荷試験を開始しないでほしいのだがそうなっていない。

コードではこの辺
https://github.com/locustio/locust/blob/b7a63e4e2f302e2273bc22bb8f57a54bfa7b9c83/locust/main.py#L548

Issueもあった。この挙動を正とするらしい
{{< card-link "https://github.com/locustio/locust/issues/2319" >}}

対策としては、実行タイミングが変わってしまうが `init` に処理を移すことかな…
