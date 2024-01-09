---
title: LocustのメトリクスをPrometheusで収集する
date: 2024-01-06T15:41:00+09:00
tags:
- Locust
- Prometheus
---

[Locust](note/Locust.md) の実行中のworker数やuser数、pathごとのレスポンスタイムなどのメトリクスを [Prometheus](note/Prometheus.md) で収集できるようにしてみました。

## 実装

````python
import logging
from flask import request, Response
import six
from itertools import chain

from locust import (
    stats as locust_stats,
    runners as locust_runners,
)
from locust.env import Environment
from prometheus_client import Metric, REGISTRY, exposition


# Prometheus metricsを収集するCollector
class LocustCollector(object):
    registry = REGISTRY

    def __init__(self, environment, runner, target_service):
        self.environment = environment
        self.runner = runner
        self.target_service = target_service

    def collect(self):
        # collect metrics only when locust runner is spawning or running.
        runner = self.runner

        base_label = {"service": self.target_service}

        metric = Metric("locust_state", "State of the locust swarm", "gauge")
        metric.add_sample(
            "locust_state", value=1, labels=base_label | {"state": runner.state}
        )
        yield metric

        if runner and runner.state in (
            locust_runners.STATE_SPAWNING,
            locust_runners.STATE_RUNNING,
        ):
            stats = []
            for s in chain(
                locust_stats.sort_stats(runner.stats.entries), [runner.stats.total]
            ):
                stats.append(
                    {
                        "method": s.method,
                        "name": s.name,
                        "num_requests": s.num_requests,
                        "num_failures": s.num_failures,
                        "avg_response_time": s.avg_response_time,
                        "min_response_time": s.min_response_time or 0,
                        "max_response_time": s.max_response_time,
                        "current_rps": s.current_rps,
                        "median_response_time": s.median_response_time,
                        "ninetieth_response_time": s.get_response_time_percentile(0.9),
                        # only total stats can use current_response_time, so sad.
                        # "current_response_time_percentile_95": s.get_current_response_time_percentile(0.95),
                        "avg_content_length": s.avg_content_length,
                        "current_fail_per_sec": s.current_fail_per_sec,
                    }
                )

            # perhaps StatsError.parse_error in e.to_dict only works in python slave, take notices!
            errors = [e.to_dict() for e in six.itervalues(runner.stats.errors)]

            metric = Metric("locust_user_count", "Swarmed users", "gauge")
            metric.add_sample(
                "locust_user_count", value=runner.user_count, labels=base_label
            )
            yield metric

            metric = Metric("locust_errors", "Locust requests errors", "gauge")
            for err in errors:
                metric.add_sample(
                    "locust_errors",
                    value=err["occurrences"],
                    labels=base_label
                    | {
                        "path": err["name"],
                        "method": err["method"],
                        "error": err["error"],
                    },
                )
            yield metric

            is_distributed = isinstance(runner, locust_runners.MasterRunner)
            if is_distributed:
                metric = Metric(
                    "locust_slave_count", "Locust number of slaves", "gauge"
                )
                metric.add_sample(
                    "locust_slave_count",
                    value=len(runner.clients.values()),
                    labels=base_label,
                )
                yield metric

            metric = Metric("locust_fail_ratio", "Locust failure ratio", "gauge")
            metric.add_sample(
                "locust_fail_ratio",
                value=runner.stats.total.fail_ratio,
                labels=base_label,
            )
            yield metric

            stats_metrics = [
                "avg_content_length",
                "avg_response_time",
                "current_rps",
                "current_fail_per_sec",
                "max_response_time",
                "ninetieth_response_time",
                "median_response_time",
                "min_response_time",
                "num_failures",
                "num_requests",
            ]

            for mtr in stats_metrics:
                mtype = "gauge"
                if mtr in ["num_requests", "num_failures"]:
                    mtype = "counter"
                metric = Metric("locust_stats_" + mtr, "Locust stats " + mtr, mtype)
                for stat in stats:
                    # Aggregated stat's method label is None, so name it as Aggregated
                    # locust has changed name Total to Aggregated since 0.12.1
                    if "Aggregated" != stat["name"]:
                        metric.add_sample(
                            "locust_stats_" + mtr,
                            value=stat[mtr],
                            labels=base_label
                            | {"path": stat["name"], "method": stat["method"]},
                        )
                    else:
                        metric.add_sample(
                            "locust_stats_" + mtr,
                            value=stat[mtr],
                            labels=base_label
                            | {"path": stat["name"], "method": "Aggregated"},
                        )
                yield metric


def add_metrics_endpoint(
    environment: Environment, runner: locust_runners.Runner, target_service: str
):
    @environment.web_ui.app.route("/metrics")
    def prometheus_exporter():
        registry = REGISTRY
        encoder, content_type = exposition.choose_encoder(request.headers.get("Accept"))
        if "name[]" in request.args:
            registry = REGISTRY.restricted_registry(request.args.get("name[]"))
        body = encoder(registry)
        return Response(body, content_type=content_type)

    REGISTRY.register(LocustCollector(environment, runner, target_service))
````

## 解説

### Prometheus Collectorを実装する

[Prometheus Python Client](https://github.com/prometheus/client_python) を使い、メトリクスを収集するCollectorを実装します。

locust.statsよりpathごとのmethod、リクエスト数、成功/失敗数といった各値が取れるので、これをPrometheusのmetricに追加することができます。

### Prometheus Registryに登録する

先程作ったCollectorを、prometheus_clientのRegistryに登録します。

### /metricsエンドポイントで公開する

`@environment.web_ui.app.route("/metrics")` のアノテーションをつけることで、Web UIモードで起動したときに `/metrics` にアクセスすると登録した関数が実行されます。
ここでPrometheusが収集できる形式でメトリクスを出力します。
