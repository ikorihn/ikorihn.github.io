---
title: Go プライベートリポジトリに対してsshを使ってgo getする
date: "2022-12-28T18:05:00+09:00"
tags:
  - 'Go'
  - 'git'
lastmod: "2022-12-28T18:05:00+09:00"
---

#Go #git

go get 時にはgit cloneが動いているのでgitの設定でコントロールできる。

## tl;dr

- 環境変数 `GOPRIVATE=<private repository>` を設定する
    - 例 `export GOPRIVATE=github.com/PRIVATE`
- 秘密鍵などsshの設定をしたい場合は環境変数 `GIT_SSH_COMMAND` を設定する
    - 例 `export GIT_SSH_COMMAND=ssh -i ~/.ssh/id_rsa_privaterepo`
- `git config --global url."ssh://git@github.com".insteadOf https://github.com/` を設定する

## 調べたこと

### GOPRIVATE

golang 1.13で追加された設定値
デフォルトでsum.golang.orgにある公開のGo checksum databaseと照合して検証するが、公開していないリポジトリの場合は検証が行えずダウンロード時にエラーになる。
`GOPRIVATE` に設定したパスは検証されなくなる。


### httpsでアクセストークンを使ってcloneする

[GitHubのprivate repositoryを含んだ場合のGo Modules管理 | おそらくはそれさえも平凡な日々](https://songmu.jp/riji/entry/2019-07-29-go-private-modules.html)

go get は通常ではhttpsのURLでcloneしようとする。
GitHubやBitbucketではアクセストークンを使ってhttpsでcloneできる。
`insteadOf` でURLを上書きすることで、go get時に認証情報を使ってgit cloneされるようにできる

```shell
$ git config --global url."https://${USER}:${PERSONAL_TOKEN}@bitbucket.org/".insteadOf "https://bitbucket.org/"
$ cat ~/.gitconfig
[url "https://<user>:<token>@bitbucket.org/"]
        insteadOf = https://bitbucket.org/
```

これだと上記のようにgitconfigにアクセストークンが書かれてしまうので、他の人も見える環境だとあまり良くない。

### go getでsshの設定をする

bitbucketの例
`https://bitbucket.org/` のかわりに `ssh://git@bitbucket.org/` が使われるようにする

```shell
git config --global url."ssh://git@bitbucket.org/".insteadOf https://bitbucket.org/
```

`~/.ssh/id_rsa` が存在して、公開鍵をホスティングサービス上に登録していれば、sshでgo getできる

```shell
$ ls -al ~/.ssh/id_rsa
.r-------- # 存在してpermissionが適切になっている

# 公開鍵をknown_hostsに登録していないと接続時にエラーになるため予め入れておく
$ ssh-keygen -F bitbucket.org || ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts

$ go get bitbucket.org/private-repo
=> 取得できた
```

ファイルがなかったり公開鍵を登録していなかったりすると `Permission denied (publickey).` のエラーが出る。

### 秘密鍵のファイルパスを指定する

`~/.ssh/id_rsa` 以外の鍵を指定したい場合はさらに設定が必要となる。

[git clone 時に秘密鍵を指定する - Qiita](https://qiita.com/sonots/items/826b90b085f294f93acf)

#### `~/.ssh/config` をいじる

```ssh-config
Host bitbucket.org
  IdentityFile ~/.ssh/id_rsa_privaterepo
```

これでgo getできた。
しかし全体の設定をいじることになるためあまりやりたくない。

#### `core.sshCommand` を設定する

```shell
$ git config --global core.sshCommand "ssh -i ~/.ssh/id_rsa_privaterepo -F /dev/null"
```

これでgit clone時にはsshキーが使われたのだが、go get時にはなぜか使われなかった。。

ちなみに一時的に config 設定をしたい場合は `git -c` で設定できて、普通にgit cloneするときはこれでもいい

```shell
$ git -c core.sshCommand="ssh -i ~/.ssh/id_rsa_privaterepo -F /dev/null" clone ssh://git@bitbucket.org/private.git
```


#### `GIT_SSH_COMMAND` 環境変数を設定する

同じことで悩んでいる人がいた。
[git - How can you specify which ssh key `go get` will use - Stack Overflow](https://stackoverflow.com/questions/65569280/how-can-you-specify-which-ssh-key-go-get-will-use)

[GIT_SSH_COMMAND](https://git-scm.com/docs/git#Documentation/git.txt-codeGITSSHCOMMANDcode) の設定は効くということだった。

```shell
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_privaterepo -o StrictHostKeyChecking=no -F /dev/null"
```

実際これで指定した鍵を使ってgo getすることができた。

### `fatal: detected dubious ownership` エラー

共有ディレクトリに `GOMODCACHE` を指定していたためにこのエラーも発生した。
[[Git fatal detected dubious ownership in repositoryエラー]]

こちらを設定した

```
git config --global safe.directory '*'
```

### Jenkins上で実行する

worker上に秘密鍵を置いていない場合、credentialからssh private keyを取得して使うことになる。

まずは `~/.ssh/id_rsa` に鍵を置いてみた

```groovy
pipeline {
  agent {
    label "worker"
  }

  stages {
    stage('clone'){
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'git_ssh_key', keyFileVariable: 'GIT_SSH_KEY')]) {
            sh '''
            mkdir -p ~/.ssh
            cp "$BITBUCKET_SSH_KEY" ~/.ssh/id_rsa
            chmod 400 ~/.ssh/id_rsa

            ssh-keygen -F bitbucket.org || ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts
            export GOPRIVATE='bitbucket.org'

            git config --global url."ssh://git@bitbucket.org/".insteadOf https://bitbucket.org/

            go get bitbucket.org/my/repo
            '''
        }
      }
    }
  }
}
```

これでも良かったが、credentialの値を別の場所にコピーして使うというのが気持ち悪かったので、 `GIT_SSH_COMMAND` を使った。

#### GIT_SSH_COMMAND版

```groovy
pipeline {

  stages {
    stage('clone'){
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'git_ssh_key', keyFileVariable: 'GIT_SSH_KEY')]) {
            sh '''
            ssh-keygen -F bitbucket.org || ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts
            export GIT_SSH_COMMAND="ssh -i $GIT_SSH_KEY -F /dev/null"
            export GOPRIVATE='bitbucket.org'

            git config --global url."ssh://git@bitbucket.org/".insteadOf https://bitbucket.org/

            go get bitbucket.org/my/repo
            '''
        }
      }
    }
  }
}
```

