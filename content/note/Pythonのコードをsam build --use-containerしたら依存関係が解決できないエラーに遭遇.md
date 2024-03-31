---
title: Pythonのコードをsam build --use-containerしたら依存関係が解決できないエラーに遭遇
date: 2024-03-11T15:01:00+09:00
tags:
  - Python
  - Docker
  - sam
---
 

[[Python AWS Lambdaに依存関係を含めてzipでデプロイする]] を[[SAM]] でやろうとしたらうまくいかなかった話

```
.
├── main.py
├── template.yaml
└── requirements.txt

$ cat requirements.txt
boto3==1.34.58 ; python_version >= "3.12" and python_version < "4.0"
botocore==1.34.58 ; python_version >= "3.12" and python_version < "4.0"

$ cat template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  Lambda Function triggerd by S3

Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: main.lambda_handler
      Description: >-
        Triggered when object is created
      MemorySize: 128
      Timeout: 30
      FunctionName: my-function
      Runtime: python3.12
      Architectures:
        - arm64
      Role: "arn:aws:iam::000000000000:role/LambdaRole"
```

`--use-container` を使って、コンテナ内でビルドしようとしたところ、以下のエラーでビルドに失敗した。

```shell
$ sam build --use-container
...<依存関係をダウンロードするメッセージ>
Unable to find Click Context for getting session_id.
Error: PythonPipBuilder:ResolveDependencies - WARNING: pip is being invoked by an old script wrapper. This will fail in a future version of pip.
Please see https://github.com/pypa/pip/issues/5599 for advice on fixing the underlying issue.
To avoid this problem you can invoke Python with '-m pip' instead of running pip directly.
ERROR: Exception:
Traceback (most recent call last):
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/cli/base_command.py", line 180, in exc_logging_wrapper
    status = run_func(*args)
             ^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/cli/req_command.py", line 248, in wrapper
    return func(self, options, args)
           ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/commands/download.py", line 132, in run
    requirement_set = resolver.resolve(reqs, check_supported_wheels=True)
```


類似のISSUEが上がっていた。
https://github.com/aws/aws-sam-cli/issues/4054#issuecomment-1690236237 
おそらく、ビルド環境がProxy配下で、DockerコンテナにproxyのURLを設定していないためなのかな…と思った。
エラーメッセージからは全然そうは読み取れないので違うかもしれないけど

`--use-container` を外したらビルドが通ってしまったので、深追いはしていない

=> 以下追加調査した結果の追記

## Python in dockerでpip install時にRuntimeError: can't start new threadのエラーが出ていた

`WARNING: pip is being invoked by an old script wrapper. This will fail in a future version of pip` はあくまで警告で、直接的には関係がなかった。
ちゃんとエラーログを追ったところ、本当のエラーはこっち

```
ERROR: Exception:
Traceback (most recent call last):
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/cli/base_command.py", line 180, in exc_logging_wrapper
    status = run_func(*args)
             ^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/cli/req_command.py", line 248, in wrapper
    return func(self, options, args)
           ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/commands/download.py", line 132, in run
    requirement_set = resolver.resolve(reqs, check_supported_wheels=True)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/resolver.py", line 92, in resolve
    result = self._result = resolver.resolve(
                            ^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/resolvelib/resolvers.py", line 546, in resolve
    state = resolution.resolve(requirements, max_rounds=max_rounds)
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/resolvelib/resolvers.py", line 397, in resolve
    self._add_to_criteria(self.state.criteria, r, parent=None)
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/resolvelib/resolvers.py", line 173, in _add_to_criteria
    if not criterion.candidates:
           ^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/resolvelib/structs.py", line 156, in __bool__
    return bool(self._sequence)
           ^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/found_candidates.py", line 155, in __bool__
    return any(self)
           ^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/found_candidates.py", line 143, in <genexpr>
    return (c for c in iterator if id(c) not in self._incompatible_ids)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/found_candidates.py", line 47, in _iter_built
    candidate = func()
                ^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/factory.py", line 206, in _make_candidate_from_link
    self._link_candidate_cache[link] = LinkCandidate(
                                       ^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/candidates.py", line 293, in __init__
    super().__init__(
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/candidates.py", line 156, in __init__
    self.dist = self._prepare()
                ^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/candidates.py", line 225, in _prepare
    dist = self._prepare_distribution()
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/candidates.py", line 304, in _prepare_distribution
    return preparer.prepare_linked_requirement(self._ireq, parallel_builds=True)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 532, in prepare_linked_requirement
    metadata_dist = self._fetch_metadata_only(req)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 383, in _fetch_metadata_only
    return self._fetch_metadata_using_link_data_attr(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 403, in _fetch_metadata_using_link_data_attr
    metadata_file = get_http_url(
                    ^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 107, in get_http_url
    from_path, content_type = download(link, temp_dir.path)
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/network/download.py", line 147, in __call__
    for chunk in chunks:
  File "/var/lang/lib/python3.12/site-packages/pip/_internal/cli/progress_bars.py", line 52, in _rich_progress_bar
    with progress:
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/rich/progress.py", line 1169, in __enter__
    self.start()
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/rich/progress.py", line 1160, in start
    self.live.start(refresh=True)
  File "/var/lang/lib/python3.12/site-packages/pip/_vendor/rich/live.py", line 132, in start
    self._refresh_thread.start()
  File "/var/lang/lib/python3.12/threading.py", line 992, in start
    _start_new_thread(self._bootstrap, ())
RuntimeError: can't start new thread
```

[multithreading - Python in docker – RuntimeError: can't start new thread - Stack Overflow](https://stackoverflow.com/questions/70087344/python-in-docker-runtimeerror-cant-start-new-thread)

`--progress-bar off` にするといいよというコメントがあって、半信半疑でつけてみたら通ってしまった。

```shell
$ docker run --rm -v $(pwd):/var/task public.ecr.aws/sam/build-python3.12:latest-x86_64 pip install -r requirements.txt --progress-bar off
```

じゃあsam build時にこのオプションつけるにはどうしたらいいのか…？
そんなものはなさそうだった。。結局振り出しに戻る。
根本的に解決するにはおそらく、glibcやDockerなどいろいろなバージョンを更新しないとだめそう。

## workaround

ビルド環境の制約上Pythonやglibc等のバージョンをこれ以上上げるのは大変。
なので次のようにしてみた。

```shell
# あらかじめホストで依存関係をダウンロードしてからrequirements.txtを削除することで、sam build内ではダウンロードされないようにする
# poetryからexportしたrequirements.txtにはPythonのバージョンが指定されており、ホストにインストールされているPythonのバージョンとミスマッチを起こすのでpython_versionを削除する
cat requirements.txt | cut -d ';' -f 1 | sed -e 's/ \+$//' > tmp && mv tmp requirements.txt
pip3 install -r requirements.txt -t .
rm requirements.txt

sam build
sam deploy
```

これはだいぶトリッキーなことをしているので、またすぐに壊れそうではあるが一応動いた。次のようなことに注意する
- ホストのpipバージョンに依存してしまうが、3.8以上は入っているので許容することとした
- 

## 参考

- [SAM CLI の Docker内(--use-container) ビルドをProxy環境下で実施する方法 #AWS - Qiita](https://qiita.com/komikoni/items/a55e9533bf5e588c85e7)