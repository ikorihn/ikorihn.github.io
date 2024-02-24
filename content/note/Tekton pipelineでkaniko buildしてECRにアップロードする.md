---
title: Tekton pipelineでkaniko buildしてECRにアップロードする
date: 2024-02-20T22:30:00+09:00
tags:
  - Docker
---

[[Tekton]] PipelineでDocker imageをビルド、private registryへのアップロードを行う。

## Tekton Hubから必要なタスクを追加

```shell
$ tkn hub install task git-clone
$ tkn hub install task kaniko
```

## assume-roleするタスクを追加

今回はECRにアップロードするためのロールにassume-roleで認証する方式を使う

```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: assume-role
spec:
  params:
    - name: AWS_ROLE
      type: string
    - name: SESSION_NAME
      type: string
  workspaces:
    - name: awscredentials
  steps:
    - name: assume-role
      image: public.ecr.aws/aws-cli/aws-cli:latest
      results:
        - name: aws-access-key-id
        - name: aws-secret-access-key
        - name: aws-session-token
      script: |
        #!/bin/sh
        creds=$(aws --output text sts assume-role --role-arn $(params.AWS_ROLE) --role-session-name $(params.SESSION_NAME) | grep CREDENTIALS | cut -f2,4,5)
        export AWS_ACCESS_KEY_ID=$(echo $creds | tr -s ' ' | cut -d ' ' -f1)
        export AWS_SECRET_ACCESS_KEY=$(echo $creds | tr -s ' ' | cut -d ' ' -f2)
        export AWS_SESSION_TOKEN=$(echo $creds | tr -s ' ' | cut -d ' ' -f3)
        echo ${AWS_ACCESS_KEY_ID} > $(results.aws-access-key-id.path)
        echo ${AWS_SECRET_ACCESS_KEY} > $(results.aws-secret-access-key.path)
        echo ${AWS_SESSION_TOKEN} > $(results.aws-session-token.path)
``` 


## pipelineを作成

```yaml
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: clone-build-push
spec:
  description: |
    This pipeline clones a git repo, builds a Docker image with Kaniko and
    pushes it to a registry
  params:
    - name: repo-url
      type: string
    - name: image-reference
      type: string
    - name: dockerfile
      type: string
    - name: docker-context
      type: string
  workspaces:
    - name: shared-data
    - name: docker-credentials
  tasks:
    - name: fetch-source
      taskRef:
        name: git-clone
      workspaces:
        - name: output
          workspace: shared-data
      params:
        - name: url
          value: $(params.repo-url)

    - name: assume-role
      taskRef:
        name: assume-role

    - name: build-push
      runAfter: ["fetch-source"]
      taskRef:
        name: kaniko
      workspaces:
        - name: source
          workspace: shared-data
        - name: dockerconfig
          workspace: docker-credentials
      env:
      - name: AWS_ACCESS_KEY_ID
        value: $(results.assume-role.aws-access-key-id.log)
      - name: AWS_SECRET_ACCESS_KEY
        value: $(results.assume-role.aws-secret-access-key.log)
      - name: AWS_SESSION_TOKEN
        value: $(results.assume-role.aws-session-token.log)
      params:
        - name: IMAGE
          value: $(params.image-reference)
        - name: DOCKERFILE
          value: $(params.dockerfile)
        - name: CONTEXT
          value: $(params.docker-context)

```
