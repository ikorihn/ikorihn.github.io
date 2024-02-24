{{< card-link "https://tekton.dev/" >}}

Tektonは [[Kubernetes]] 上で動くOSSのCI/CDツール。

ジョブの定義であるTaskやPipeline、それを実行するTaskRunやPipelineRunなどがすべてKubernetesリソースとして作成される。

Tekton はクラウドネイティブな特性を考慮して開発されたカスタムコントローラーのセットと、いくつかのカスタムリソースを組み合わせて、CI/CD パイプラインを定義する

- Step: 1つの処理
- Task: Stepをまとめた1機能(例: git cloneするTask、Docker imageをビルドするTask)
- Pipeline: Taskをまとめて一連の処理を実行する
- Trigger: パイプラインを開始するイベント
- Dashboard: Web UI

## 参考資料

- [Tekton 徹底解説、Operatorによるインストールとはじめの一歩（学習シリーズ01）](https://blog.mosuke.tech/entry/2020/05/10/tekton-operator/)
- [Tekton と Argo CD を使用した AWS でのクラウドネイティブな CI/CD | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/cloud-native-ci-cd-with-tekton-and-argocd-on-aws/)

## install

[Operator](https://github.com/tektoncd/operator/blob/main/docs/install.md) を使ってインストールするのが簡単だ


```shell
# Operatorをインストールする
$ kubectl apply -f https://storage.googleapis.com/tekton-releases/operator/latest/release.yaml

# Operator経由でコンポーネントをインストールする。allの場合はすべて
$ kubectl apply -f https://raw.githubusercontent.com/tektoncd/operator/main/config/crs/kubernetes/config/all/operator_v1alpha1_config_cr.yaml


```

これで各コンポーネントのリソースが作成される

```shell
❯ k get pods -n tekton-operator
NAME                                       READY   STATUS    RESTARTS   AGE
tekton-operator-74b7d57b7c-5pmvp           2/2     Running   0          8d
tekton-operator-webhook-64cffc6467-jc4h5   1/1     Running   0          8d

❯ k get pods -n tekton-pipelines
NAME                                                 READY   STATUS    RESTARTS   AGE
tekton-chains-controller-5666bd9786-m64gm            1/1     Running   0          8d
tekton-dashboard-5d9b4b4479-pgqd7                    1/1     Running   0          8d
tekton-events-controller-78bc6f9686-mgtd5            1/1     Running   0          8d
tekton-operator-proxy-webhook-7b986f7987-jb2zd       1/1     Running   0          8d
tekton-pipelines-controller-86c79995f-8g8wj          1/1     Running   0          8d
tekton-pipelines-remote-resolvers-7df64d9b8f-42hn6   1/1     Running   0          8d
tekton-pipelines-webhook-6d8f7bb45b-wrl2r            1/1     Running   0          8d
tekton-triggers-controller-69c7994869-j85vg          1/1     Running   0          8d
tekton-triggers-core-interceptors-7945c64c7-mngnt    1/1     Running   0          8d
tekton-triggers-webhook-5d7c6bf975-9hb4k             1/1     Running   0          8d
```


### Dashboard 

ローカルではport-forwardでサービスを公開することでWeb UIが見れるようになる

```shell
$ kubectl port-forward -n tekton-pipelines service/tekton-dashboard 9097:9097
```
