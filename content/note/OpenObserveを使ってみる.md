---
title: OpenObserveを使ってみる
date: "2023-06-29T18:34:00+09:00"
tags:
  - '2023/06/29'
  - Observability
lastmod: '2023-06-29T18:38:48+09:00'
---

{{< card-link "https://openobserve.ai" >}} 

[[Kibana]] のように、ログデータの可視化を行うツールで、ログ、メトリクス、トレースをペタバイトレベルで扱うことができる。
ElasticsearchやDatadogと比べ、10倍簡単、140倍のストレージコスト安、ハイパフォーマンスなどを謳っている。
バックエンドは[[Rust]]、フロントエンドは[[Vue.js]]で書かれている。

絶賛開発中のようなので、破壊的な変更が入る可能性が全然ありそう。

## ストレージ

OpenObserveはデータをインデックせず、圧縮してローカルだけではなくS3などオブジェクトストレージに保存することができる。
S3に保存することで、大容量のEBSを用意する場合と比べてコストが下げられるということのようで、HA構成にした場合でもあがらないと言いたいらしい。

## アーキテクチャ

https://openobserve.ai/docs/architecture/

### 単一ノード

1台のノードで、2TB/day までのデータ量であれば扱うことができる。
全データをローカルディスクストレージに保存することもできるし、メタデータをetcd、データをS3に保存するということもできる。
拡張性を考えると単一ノードでもオブジェクトストレージを使ったほうがよさそう。

### HA構成

HAモードではローカルディスクは使用できないので、必ずS3などが保存先になる。
以下複数の役割のノードで構成される。

- Ingester: 投入されたデータをparquetフォーマットに変換して、オブジェクトストレージに保存する。受け取ったデータを即オブジェクトストレージに転送するのではなく、ある程度ローカルに貯めてから転送するようだ。
- Querier: クエリを実行する。
- Compactor: 複数の小さいファイルを一つの大きいファイルにマージして、検索の効率を上げる
- Router: リクエストをingesterやquerierに分配する、proxyの役割。
- AlertManager: 定期実行やアラート通知

デプロイは https://openobserve.ai/docs/ha_deployment/ を参照。
今のところ [[Kubernetes]] にhelmでデプロイする手順のみが用意されている。
[EC2やECSでもやれなくはない](https://discuss.openobserve.ai/kb/t/ha-deployment-on-aws-ecs-or-ec2/2K1d28) が公式手順はないので、自分でkubernetesのマニフェスト見ながら頑張るしかなさそう。

## データ摂取(ingestion)

https://openobserve.ai/docs/ingestion/logs/python/#python

ログやメトリクスはFluent-bitやKinesis Firehose、curlなどさまざまなソースからHTTP APIで投入できる。
すでに構築済みのデータ投入機構があれば、投入先をOpenObserveにすればよさそう


## セットアップ(セルフホスト)

https://openobserve.ai/docs/quickstart/

Dockerで簡単に起動できる

```shell
mkdir data
docker run -v $PWD/data:/data -e ZO_DATA_DIR="/data" -p 5080:5080 -e ZO_ROOT_USER_EMAIL="root@example.com" -e ZO_ROOT_USER_PASSWORD="Complexpass#123" public.ecr.aws/zinclabs/openobserve:latest
```

=> localhost:5080 で開く

サンプルデータも用意してくれているのでそれを投入すれば閲覧できる

```shell
curl -L https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip -o k8slog_json.json.zip
unzip k8slog_json.json.zip
curl http://localhost:5080/api/default/default/_json -i -u "root@example.com:Complexpass#123"  -d "@k8slog_json.json"
```

## サンプルデータを作成する

本題ではないが、今後役立ちそうなのでfakeデータをつくってみる。
fakeの作成には https://github.com/brianvoe/gofakeit を使った。

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brianvoe/gofakeit/v6"
)

type accessLog struct {
	Timestamp    time.Time `fake:"{daterange:2023-06-30T16:00:00,2023-06-30T16:59:59,yyyy-MM-ddTHH:mm:ss}" format:"2006-01-02T15:04:05"`
	Path         string    `fake:"{urlpath}"`
	Method       string    `fake:"{httpmethod}"`
	InstanceId   string    `fake:"{regex:i-[a-f]{1}}"`
	ResponseTime int       `fake:"{number:1500,3000}"`
	Status       int       `fake:"{httpstatuscodesimple}"`
}

func main() {
	faker := gofakeit.NewUnlocked(0)

	gofakeit.AddFuncLookup("urlpath", gofakeit.Info{
		Category:    "custom",
		Description: "Path only",
		Example:     "/image",
		Output:      "string",
		Generate: func(r *rand.Rand, m *gofakeit.MapParams, info *gofakeit.Info) (interface{}, error) {
			return gofakeit.RandomString([]string{"/example", "/image", "/hello", "/health", "/ping", "/login", "/account", "/route", "/spot"}), nil
		},
	})

	logs := make([]accessLog, 0)
	for i := 0; i < 5000; i++ {
		var l accessLog
		err := faker.Struct(&l)
		if err != nil {
			log.Fatalln(err)
		}
		logs = append(logs, l)
	}

	b, err := json.Marshal(logs)
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println(string(b))
}

```

大量に作ってぶっこんでパフォーマンス検証

```
while true; do JSON=fake_$(date +%s).json; ./faker -count 10000 > $JSON; curl http://localhost:5080/api/default/fake/_json -i -u "root@example.com:Complexpass#123"  -d "@${JSON}"; rm "${JSON}"; sleep 1; done
```

## HA構成をKubernetesで動かす

[[Rancher Desktop]] の [[Kubernetes]] にデプロイして、HA構成を試してみる。

HA構成の場合はオブジェクトストレージが必須なので、事前に [[MinIOをローカルのkubernetesで動かす]]
==> OpenObserveのhelm内にminioが内包されていたので不要だった。。気づくの遅かった

そうしたらhelm chartが用意されているのでデプロイする

{{< card-link "https://github.com/openobserve/openobserve-helm-chart/" >}}

values.yaml

```yaml
serviceAccount:
  # Annotations to add to the service account
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::12345353456:role/zo-s3-eks

replicaCount:
  ingester: 1
  querier: 1
  router: 1
  alertmanager: 1
  compactor: 1

minio:
  enabled: true # if true then minio will be deployed as part of openobserve
```

デプロイ

```shell
helm --namespace openobserve -f values.yaml install --create-namespace o1 openobserve/openobserve

```

localhost:5080 で開く

```shell
kubectl --namespace openobserve port-forward svc/o1-openobserve-router 5080:5080
```

minioの中身確認

```shell
kubectl run awscli -it --rm --image amazon/aws-cli --env=AWS_ACCESS_KEY_ID=rootuser --env=AWS_SECRET_ACCESS_KEY=rootpass123 --command -- sh

sh-4.2$ aws --endpoint-url http://o1-minio-svc.openobserve.svc.cluster.local:9000 --no-verify-ssl s3 ls
1-01-01 00:00:00    mysuperduperbucket
```

## HA構成をDocker composeで動かす

helmでデプロイされたリソースから、ある程度動くようにDocker composeに落とし込む。

```yaml
services:
  querier:
    image: public.ecr.aws/zinclabs/openobserve:latest
    expose:
      - 5080
      - 5081
    restart: on-failure
    depends_on:
      - etcd-1
      - etcd-2
      - minio
    environment:
      - ZO_NODE_ROLE=querier
      - OTEL_OTLP_HTTP_ENDPOINT=http://127.0.0.1:5080/api/nexus/traces
      - RUST_BACKTRACE=1
      - RUST_LOG=info
      - ZO_BASE_URI=
      - ZO_COLS_PER_RECORD_LIMIT=200
      - ZO_COMPACT_BLOCKED_ORGS=
      - ZO_COMPACT_DATA_RETENTION_DAYS=0
      - ZO_COMPACT_ENABLED=true
      - ZO_COMPACT_FAKE_MODE=false
      - ZO_COMPACT_INTERVAL=60
      - ZO_COMPACT_MAX_FILE_SIZE=2
      - ZO_DATA_DIR=./data/
      - ZO_DATA_STREAM_DIR=
      - ZO_DATA_WAL_DIR=
      - ZO_ETCD_ADDR=etcd-1:2379
      - ZO_ETCD_CERT_FILE=
      - ZO_ETCD_CLIENT_CERT_AUTH=false
      - ZO_ETCD_COMMAND_TIMEOUT=5
      - ZO_ETCD_CONNECT_TIMEOUT=2
      - ZO_ETCD_DOMAIN_NAME=
      - ZO_ETCD_KEY_FILE=
      - ZO_ETCD_LOAD_PAGE_SIZE=10000
      - ZO_ETCD_LOCK_WAIT_TIMEOUT=600
      - ZO_ETCD_PASSWORD=
      - ZO_ETCD_PREFIX=/zinc/observe/
      - ZO_ETCD_TRUSTED_CA_FILE=
      - ZO_ETCD_USER=
      - ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS=false
      - ZO_FEATURE_PER_THREAD_LOCK=false
      - ZO_FILE_EXT_JSON=.json
      - ZO_FILE_EXT_PARQUET=.parquet
      - ZO_FILE_MOVE_THREAD_NUM=0
      - ZO_FILE_PUSH_INTERVAL=10
      - ZO_GRPC_ORG_HEADER_KEY=zinc-org-id
      - ZO_GRPC_PORT=5081
      - ZO_GRPC_TIMEOUT=600
      - ZO_HEARTBEAT_INTERVAL=30
      - ZO_HTTP_IPV6_ENABLED=false
      - ZO_HTTP_PORT=5080
      - ZO_INSTANCE_NAME=
      - ZO_JSON_LIMIT=209715200
      - ZO_LOCAL_MODE=false
      - ZO_LOCAL_MODE_STORAGE=disk
      - ZO_LUA_FN_ENABLED=false
      - ZO_MAX_FILE_RETENTION_TIME=10
      - ZO_MAX_FILE_SIZE_ON_DISK=1
      - ZO_MEMORY_CACHE_CACHE_LATEST_FILES=false
      - ZO_MEMORY_CACHE_ENABLED=true
      - ZO_MEMORY_CACHE_MAX_SIZE=0
      - ZO_MEMORY_CACHE_RELEASE_SIZE=0
      - ZO_METRICS_DEDUP_ENABLED=true
      - ZO_METRICS_LEADER_ELECTION_INTERVAL=30
      - ZO_METRICS_LEADER_PUSH_INTERVAL=15
      - ZO_PARQUET_COMPRESSION=zstd
      - ZO_PAYLOAD_LIMIT=209715200
      - ZO_PROMETHEUS_HA_CLUSTER=cluster
      - ZO_PROMETHEUS_HA_REPLICA=__replica__
      - ZO_QUERY_THREAD_NUM=0
      - ZO_ROUTE_TIMEOUT=600
      - ZO_S3_BUCKET_NAME=mysuperduperbucket
      - ZO_S3_BUCKET_PREFIX=mysuperduperbucket
      - ZO_S3_PROVIDER=minio
      - ZO_S3_REGION_NAME=us-east-1
      - ZO_S3_SERVER_URL=http://minio:9000
      - ZO_SKIP_SCHEMA_VALIDATION=false
      - ZO_SLED_DATA_DIR=
      - ZO_SLED_PREFIX=/zinc/observe/
      - ZO_TELEMETRY=true
      - ZO_TELEMETRY_URL=https://e1.zinclabs.dev
      - ZO_TIME_STAMP_COL=_timestamp
      - ZO_TRACING_ENABLED=false
      - ZO_TRACING_HEADER_KEY=Authorization
      - ZO_TRACING_HEADER_VALUE=Basic YWRtaW46Q29tcGxleHBhc3MjMTIz
      - ZO_TS_ALLOWED_UPTO=5
      - ZO_UI_ENABLED=true
      - ZO_WAL_LINE_MODE_ENABLED=true
      - ZO_WAL_MEMORY_MODE_ENABLED=false
      - ZO_WIDENING_SCHEMA_EVOLUTION=false
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_S3_ACCESS_KEY=rootuser
      - ZO_S3_SECRET_KEY=rootpass123

  ingester:
    image: public.ecr.aws/zinclabs/openobserve:latest
    expose:
      - 5080
      - 5081
    restart: on-failure
    depends_on:
      - etcd-1
      - etcd-2
      - minio
    volumes:
      - ./data:/data
    environment:
      - ZO_NODE_ROLE=ingester
      - OTEL_OTLP_HTTP_ENDPOINT=http://127.0.0.1:5080/api/nexus/traces
      - RUST_BACKTRACE=1
      - RUST_LOG=info
      - ZO_BASE_URI=
      - ZO_COLS_PER_RECORD_LIMIT=200
      - ZO_COMPACT_BLOCKED_ORGS=
      - ZO_COMPACT_DATA_RETENTION_DAYS=0
      - ZO_COMPACT_ENABLED=true
      - ZO_COMPACT_FAKE_MODE=false
      - ZO_COMPACT_INTERVAL=60
      - ZO_COMPACT_MAX_FILE_SIZE=2
      - ZO_DATA_DIR=./data/
      - ZO_DATA_STREAM_DIR=
      - ZO_DATA_WAL_DIR=
      - ZO_ETCD_ADDR=etcd-1:2379
      - ZO_ETCD_CERT_FILE=
      - ZO_ETCD_CLIENT_CERT_AUTH=false
      - ZO_ETCD_COMMAND_TIMEOUT=5
      - ZO_ETCD_CONNECT_TIMEOUT=2
      - ZO_ETCD_DOMAIN_NAME=
      - ZO_ETCD_KEY_FILE=
      - ZO_ETCD_LOAD_PAGE_SIZE=10000
      - ZO_ETCD_LOCK_WAIT_TIMEOUT=600
      - ZO_ETCD_PASSWORD=
      - ZO_ETCD_PREFIX=/zinc/observe/
      - ZO_ETCD_TRUSTED_CA_FILE=
      - ZO_ETCD_USER=
      - ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS=false
      - ZO_FEATURE_PER_THREAD_LOCK=false
      - ZO_FILE_EXT_JSON=.json
      - ZO_FILE_EXT_PARQUET=.parquet
      - ZO_FILE_MOVE_THREAD_NUM=0
      - ZO_FILE_PUSH_INTERVAL=10
      - ZO_GRPC_ORG_HEADER_KEY=zinc-org-id
      - ZO_GRPC_PORT=5081
      - ZO_GRPC_TIMEOUT=600
      - ZO_HEARTBEAT_INTERVAL=30
      - ZO_HTTP_IPV6_ENABLED=false
      - ZO_HTTP_PORT=5080
      - ZO_INSTANCE_NAME=
      - ZO_JSON_LIMIT=209715200
      - ZO_LOCAL_MODE=false
      - ZO_LOCAL_MODE_STORAGE=disk
      - ZO_LUA_FN_ENABLED=false
      - ZO_MAX_FILE_RETENTION_TIME=10
      - ZO_MAX_FILE_SIZE_ON_DISK=1
      - ZO_MEMORY_CACHE_CACHE_LATEST_FILES=false
      - ZO_MEMORY_CACHE_ENABLED=true
      - ZO_MEMORY_CACHE_MAX_SIZE=0
      - ZO_MEMORY_CACHE_RELEASE_SIZE=0
      - ZO_METRICS_DEDUP_ENABLED=true
      - ZO_METRICS_LEADER_ELECTION_INTERVAL=30
      - ZO_METRICS_LEADER_PUSH_INTERVAL=15
      - ZO_PARQUET_COMPRESSION=zstd
      - ZO_PAYLOAD_LIMIT=209715200
      - ZO_PROMETHEUS_HA_CLUSTER=cluster
      - ZO_PROMETHEUS_HA_REPLICA=__replica__
      - ZO_QUERY_THREAD_NUM=0
      - ZO_ROUTE_TIMEOUT=600
      - ZO_S3_BUCKET_NAME=mysuperduperbucket
      - ZO_S3_BUCKET_PREFIX=mysuperduperbucket
      - ZO_S3_PROVIDER=minio
      - ZO_S3_REGION_NAME=us-east-1
      - ZO_S3_SERVER_URL=http://minio:9000
      - ZO_SKIP_SCHEMA_VALIDATION=false
      - ZO_SLED_DATA_DIR=
      - ZO_SLED_PREFIX=/zinc/observe/
      - ZO_TELEMETRY=true
      - ZO_TELEMETRY_URL=https://e1.zinclabs.dev
      - ZO_TIME_STAMP_COL=_timestamp
      - ZO_TRACING_ENABLED=false
      - ZO_TRACING_HEADER_KEY=Authorization
      - ZO_TRACING_HEADER_VALUE=Basic YWRtaW46Q29tcGxleHBhc3MjMTIz
      - ZO_TS_ALLOWED_UPTO=5
      - ZO_UI_ENABLED=true
      - ZO_WAL_LINE_MODE_ENABLED=true
      - ZO_WAL_MEMORY_MODE_ENABLED=false
      - ZO_WIDENING_SCHEMA_EVOLUTION=false
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_S3_ACCESS_KEY=rootuser
      - ZO_S3_SECRET_KEY=rootpass123

  router:
    image: public.ecr.aws/zinclabs/openobserve:latest
    ports:
      - 5080:5080
    restart: on-failure
    depends_on:
      - etcd-1
      - etcd-2
      - minio
    expose:
      - 5080
      - 5081
    environment:
      - ZO_NODE_ROLE=router
      - OTEL_OTLP_HTTP_ENDPOINT=http://127.0.0.1:5080/api/nexus/traces
      - RUST_BACKTRACE=1
      - RUST_LOG=info
      - ZO_BASE_URI=
      - ZO_COLS_PER_RECORD_LIMIT=200
      - ZO_COMPACT_BLOCKED_ORGS=
      - ZO_COMPACT_DATA_RETENTION_DAYS=0
      - ZO_COMPACT_ENABLED=true
      - ZO_COMPACT_FAKE_MODE=false
      - ZO_COMPACT_INTERVAL=60
      - ZO_COMPACT_MAX_FILE_SIZE=2
      - ZO_DATA_DIR=./data/
      - ZO_DATA_STREAM_DIR=
      - ZO_DATA_WAL_DIR=
      - ZO_ETCD_ADDR=etcd-1:2379
      - ZO_ETCD_CERT_FILE=
      - ZO_ETCD_CLIENT_CERT_AUTH=false
      - ZO_ETCD_COMMAND_TIMEOUT=5
      - ZO_ETCD_CONNECT_TIMEOUT=2
      - ZO_ETCD_DOMAIN_NAME=
      - ZO_ETCD_KEY_FILE=
      - ZO_ETCD_LOAD_PAGE_SIZE=10000
      - ZO_ETCD_LOCK_WAIT_TIMEOUT=600
      - ZO_ETCD_PASSWORD=
      - ZO_ETCD_PREFIX=/zinc/observe/
      - ZO_ETCD_TRUSTED_CA_FILE=
      - ZO_ETCD_USER=
      - ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS=false
      - ZO_FEATURE_PER_THREAD_LOCK=false
      - ZO_FILE_EXT_JSON=.json
      - ZO_FILE_EXT_PARQUET=.parquet
      - ZO_FILE_MOVE_THREAD_NUM=0
      - ZO_FILE_PUSH_INTERVAL=10
      - ZO_GRPC_ORG_HEADER_KEY=zinc-org-id
      - ZO_GRPC_PORT=5081
      - ZO_GRPC_TIMEOUT=600
      - ZO_HEARTBEAT_INTERVAL=30
      - ZO_HTTP_IPV6_ENABLED=false
      - ZO_HTTP_PORT=5080
      - ZO_INSTANCE_NAME=
      - ZO_JSON_LIMIT=209715200
      - ZO_LOCAL_MODE=false
      - ZO_LOCAL_MODE_STORAGE=disk
      - ZO_LUA_FN_ENABLED=false
      - ZO_MAX_FILE_RETENTION_TIME=10
      - ZO_MAX_FILE_SIZE_ON_DISK=1
      - ZO_MEMORY_CACHE_CACHE_LATEST_FILES=false
      - ZO_MEMORY_CACHE_ENABLED=true
      - ZO_MEMORY_CACHE_MAX_SIZE=0
      - ZO_MEMORY_CACHE_RELEASE_SIZE=0
      - ZO_METRICS_DEDUP_ENABLED=true
      - ZO_METRICS_LEADER_ELECTION_INTERVAL=30
      - ZO_METRICS_LEADER_PUSH_INTERVAL=15
      - ZO_PARQUET_COMPRESSION=zstd
      - ZO_PAYLOAD_LIMIT=209715200
      - ZO_PROMETHEUS_HA_CLUSTER=cluster
      - ZO_PROMETHEUS_HA_REPLICA=__replica__
      - ZO_QUERY_THREAD_NUM=0
      - ZO_ROUTE_TIMEOUT=600
      - ZO_S3_BUCKET_NAME=mysuperduperbucket
      - ZO_S3_BUCKET_PREFIX=mysuperduperbucket
      - ZO_S3_PROVIDER=minio
      - ZO_S3_REGION_NAME=us-east-1
      - ZO_S3_SERVER_URL=http://minio:9000
      - ZO_SKIP_SCHEMA_VALIDATION=false
      - ZO_SLED_DATA_DIR=
      - ZO_SLED_PREFIX=/zinc/observe/
      - ZO_TELEMETRY=true
      - ZO_TELEMETRY_URL=https://e1.zinclabs.dev
      - ZO_TIME_STAMP_COL=_timestamp
      - ZO_TRACING_ENABLED=false
      - ZO_TRACING_HEADER_KEY=Authorization
      - ZO_TRACING_HEADER_VALUE=Basic YWRtaW46Q29tcGxleHBhc3MjMTIz
      - ZO_TS_ALLOWED_UPTO=5
      - ZO_UI_ENABLED=true
      - ZO_WAL_LINE_MODE_ENABLED=true
      - ZO_WAL_MEMORY_MODE_ENABLED=false
      - ZO_WIDENING_SCHEMA_EVOLUTION=false
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_S3_ACCESS_KEY=rootuser
      - ZO_S3_SECRET_KEY=rootpass123

  compactor:
    image: public.ecr.aws/zinclabs/openobserve:latest
    restart: on-failure
    depends_on:
      - etcd-1
      - etcd-2
      - minio
    expose:
      - 5080
      - 5081
    environment:
      - ZO_NODE_ROLE=compactor
      - OTEL_OTLP_HTTP_ENDPOINT=http://127.0.0.1:5080/api/nexus/traces
      - RUST_BACKTRACE=1
      - RUST_LOG=info
      - ZO_BASE_URI=
      - ZO_COLS_PER_RECORD_LIMIT=200
      - ZO_COMPACT_BLOCKED_ORGS=
      - ZO_COMPACT_DATA_RETENTION_DAYS=0
      - ZO_COMPACT_ENABLED=true
      - ZO_COMPACT_FAKE_MODE=false
      - ZO_COMPACT_INTERVAL=60
      - ZO_COMPACT_MAX_FILE_SIZE=2
      - ZO_DATA_DIR=./data/
      - ZO_DATA_STREAM_DIR=
      - ZO_DATA_WAL_DIR=
      - ZO_ETCD_ADDR=etcd-1:2379
      - ZO_ETCD_CERT_FILE=
      - ZO_ETCD_CLIENT_CERT_AUTH=false
      - ZO_ETCD_COMMAND_TIMEOUT=5
      - ZO_ETCD_CONNECT_TIMEOUT=2
      - ZO_ETCD_DOMAIN_NAME=
      - ZO_ETCD_KEY_FILE=
      - ZO_ETCD_LOAD_PAGE_SIZE=10000
      - ZO_ETCD_LOCK_WAIT_TIMEOUT=600
      - ZO_ETCD_PASSWORD=
      - ZO_ETCD_PREFIX=/zinc/observe/
      - ZO_ETCD_TRUSTED_CA_FILE=
      - ZO_ETCD_USER=
      - ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS=false
      - ZO_FEATURE_PER_THREAD_LOCK=false
      - ZO_FILE_EXT_JSON=.json
      - ZO_FILE_EXT_PARQUET=.parquet
      - ZO_FILE_MOVE_THREAD_NUM=0
      - ZO_FILE_PUSH_INTERVAL=10
      - ZO_GRPC_ORG_HEADER_KEY=zinc-org-id
      - ZO_GRPC_PORT=5081
      - ZO_GRPC_TIMEOUT=600
      - ZO_HEARTBEAT_INTERVAL=30
      - ZO_HTTP_IPV6_ENABLED=false
      - ZO_HTTP_PORT=5080
      - ZO_INSTANCE_NAME=
      - ZO_JSON_LIMIT=209715200
      - ZO_LOCAL_MODE=false
      - ZO_LOCAL_MODE_STORAGE=disk
      - ZO_LUA_FN_ENABLED=false
      - ZO_MAX_FILE_RETENTION_TIME=10
      - ZO_MAX_FILE_SIZE_ON_DISK=1
      - ZO_MEMORY_CACHE_CACHE_LATEST_FILES=false
      - ZO_MEMORY_CACHE_ENABLED=true
      - ZO_MEMORY_CACHE_MAX_SIZE=0
      - ZO_MEMORY_CACHE_RELEASE_SIZE=0
      - ZO_METRICS_DEDUP_ENABLED=true
      - ZO_METRICS_LEADER_ELECTION_INTERVAL=30
      - ZO_METRICS_LEADER_PUSH_INTERVAL=15
      - ZO_PARQUET_COMPRESSION=zstd
      - ZO_PAYLOAD_LIMIT=209715200
      - ZO_PROMETHEUS_HA_CLUSTER=cluster
      - ZO_PROMETHEUS_HA_REPLICA=__replica__
      - ZO_QUERY_THREAD_NUM=0
      - ZO_ROUTE_TIMEOUT=600
      - ZO_S3_BUCKET_NAME=mysuperduperbucket
      - ZO_S3_BUCKET_PREFIX=mysuperduperbucket
      - ZO_S3_PROVIDER=minio
      - ZO_S3_REGION_NAME=us-east-1
      - ZO_S3_SERVER_URL=http://minio:9000
      - ZO_SKIP_SCHEMA_VALIDATION=false
      - ZO_SLED_DATA_DIR=
      - ZO_SLED_PREFIX=/zinc/observe/
      - ZO_TELEMETRY=true
      - ZO_TELEMETRY_URL=https://e1.zinclabs.dev
      - ZO_TIME_STAMP_COL=_timestamp
      - ZO_TRACING_ENABLED=false
      - ZO_TRACING_HEADER_KEY=Authorization
      - ZO_TRACING_HEADER_VALUE=Basic YWRtaW46Q29tcGxleHBhc3MjMTIz
      - ZO_TS_ALLOWED_UPTO=5
      - ZO_UI_ENABLED=true
      - ZO_WAL_LINE_MODE_ENABLED=true
      - ZO_WAL_MEMORY_MODE_ENABLED=false
      - ZO_WIDENING_SCHEMA_EVOLUTION=false
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_S3_ACCESS_KEY=rootuser
      - ZO_S3_SECRET_KEY=rootpass123

  minio:
    image: quay.io/minio/minio:latest
    container_name: example-minio
    environment:
      MINIO_ROOT_USER: rootuser
      MINIO_ROOT_PASSWORD: rootpass123
    volumes:
      - minio:/data
    command: server --address :9000 --console-address ":9001" /data
    ports:
      - 9000:9000
      - 9001:9001

  etcd-1:
    image: docker.io/bitnami/etcd:3.5.8-debian-11-r4
    expose:
      - 2379
      - 2380
    volumes:
      - etcd1:/bitnami/etcd
    environment:
      - ETCD_NAME=etcd-1
      - ETCD_DATA_DIR=/bitnami/etcd/data
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-1:2379
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-1:2380
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster-k8s
      - ETCD_INITIAL_CLUSTER_STATE=new
      - ETCD_INITIAL_CLUSTER=etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ALLOW_NONE_AUTHENTICATION=yes
  etcd-2:
    image: docker.io/bitnami/etcd:3.5.8-debian-11-r4
    expose:
      - 2379
      - 2380
    volumes:
      - etcd2:/bitnami/etcd
    environment:
      - ETCD_NAME=etcd-2
      - ETCD_DATA_DIR=/bitnami/etcd/data
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-2:2379
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-2:2380
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster-k8s
      - ETCD_INITIAL_CLUSTER_STATE=new
      - ETCD_INITIAL_CLUSTER=etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ALLOW_NONE_AUTHENTICATION=yes

volumes:
  minio:
  etcd1:
  etcd2:
```

=> `docker compose up -d` で動いた

## シングルノード+S3で動かす

シングルノード(一つのコンテナで全機能を動かす)モードで、ストレージはS3を使った場合の実行例

```yaml
services:
  app:
    image: public.ecr.aws/zinclabs/openobserve:latest
    ports:
      - 5601:5601
    depends_on:
      etcd-1:
        condition: service_healthy
      etcd-2:
        condition: service_healthy
    volumes:
      - ./data:/data
      - ./awsconfig:/root/.aws/config
    environment:
      - ZO_DATA_DIR=/data
      - ZO_HTTP_PORT=5601
      - ZO_ROOT_USER_EMAIL=root@example.com
      - ZO_ROOT_USER_PASSWORD=Complexpass#123
      - ZO_S3_REGION_NAME=ap-northeast-1
      - ZO_S3_BUCKET_NAME=mybucket
      - ZO_MAX_FILE_SIZE_ON_DISK=50
      - ZO_MAX_FILE_RETENTION_TIME=10
      - ZO_LOCAL_MODE=false
      - ZO_ETCD_ADDR=etcd-1:2379
      - ZO_PROMETHEUS_ENABLED=true

  etcd-1:
    image: docker.io/bitnami/etcd:3.5.8-debian-11-r4
    ports:
      - 2379:2379
      - 2380:2380
    expose:
      - 2379
      - 2380
    volumes:
      - etcd1:/bitnami/etcd
    healthcheck:
      test: "etcdctl endpoint health"
      interval: 10s
      timeout: 10s
      retries: 3
      start_period: 10s
    environment:
      - ETCD_NAME=etcd-1
      - ETCD_DEBUG=true
      - ETCD_DATA_DIR=/bitnami/etcd/data
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-1:2379
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-1:2380
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster-k8s
      - ETCD_INITIAL_CLUSTER_STATE=new
      - ETCD_INITIAL_CLUSTER=etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ALLOW_NONE_AUTHENTICATION=yes
  etcd-2:
    image: docker.io/bitnami/etcd:3.5.8-debian-11-r4
    expose:
      - 2379
      - 2380
    volumes:
      - etcd2:/bitnami/etcd
    healthcheck:
      test: "etcdctl endpoint health"
      interval: 10s
      timeout: 10s
      retries: 3
      start_period: 10s
    environment:
      - ETCD_NAME=etcd-2
      - ETCD_DEBUG=true
      - ETCD_DATA_DIR=/bitnami/etcd/data
      - ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
      - ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
      - ETCD_ADVERTISE_CLIENT_URLS=http://etcd-2:2379
      - ETCD_INITIAL_ADVERTISE_PEER_URLS=http://etcd-2:2380
      - ETCD_INITIAL_CLUSTER_TOKEN=etcd-cluster-k8s
      - ETCD_INITIAL_CLUSTER_STATE=new
      - ETCD_INITIAL_CLUSTER=etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380
      - ALLOW_NONE_AUTHENTICATION=yes

volumes:
  etcd1:
  etcd2:
```

### 注意点

- シングルノードだとデフォルトでローカルのディスクストレージを使用するため、 `ZO_LOCAL_MODE=false` を設定した。
    - このとき、コンテナに `~/.aws/config` が存在しないとエラーになってしまったため、 `./awsconfig:/root/.aws/config` をマウントした (https://github.com/openobserve/openobserve/issues/1099)
    - awsconfigの中身は以下のようにして、EC2のinstance profileが使われるようにした。ACCESS_KEYやSECRETでもいい。
```
[default]
region = ap-northeast-1
credential_source=Ec2InstanceMetadata
```


## ElasticsearchのAPIでデータ投入する

Elasticsearchとコンパチのインターフェースを備えており、 `/api/{organization}/_bulk` のAPIで投入することができる。

https://openobserve.ai/docs/api/ingestion/logs/bulk/

ES8のクライアント(https://github.com/elastic/go-elasticsearch)を使って作成する

```go
package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
)

func newElasticsearchBulkIndexer(ctx context.Context) (esutil.BulkIndexer, error) {
	es, err := elasticsearch.NewClient(elasticsearch.Config{
		Username: "root@example.com",
		Password: "Complexpass#123",
		Addresses: []string{
			"http://localhost:5080/api/default",
		},
		EnableDebugLogger: true,
	})
	if err != nil {
		return nil, err
	}

	indexer, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: es,
	})
	if err != nil {
		return nil, err
	}

	return indexer, nil
}

func insert(filename string) error {

	ctx := context.Background()

	indexer, err := newElasticsearchBulkIndexer(ctx)
	if err != nil {
		return err
	}

	body, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	scanner := bufio.NewScanner(bytes.NewReader(body))
	logs := make([]accessLog, 0)
	for scanner.Scan() {
		logs = append(logs, ParseLog(scanner.Text()))
	}

	for _, v := range logs {
		js, err := json.Marshal(v)
		if err != nil {
			return err
		}
		err = indexer.Add(
			ctx,
			esutil.BulkIndexerItem{
				Action: "index",
				Index:  fmt.Sprintf("log-%s-%s", "mygroup1", v.Datetime.Format("20060102")),
				Body:   bytes.NewReader(js),
			},
		)
		if err != nil {
			return err
		}

	}

	fmt.Printf("Stats: %+v\n", indexer.Stats())
	if err := indexer.Close(ctx); err != nil {
		return err
	}

	return nil
}

func main() {
	if err := insert("testdata.txt"); err != nil {
		log.Fatalf("%v", err)
	}
}
```
