---
title: M1Macでdockerのvolumeはどこにあるの
date: "2022-07-12T11:33:00+09:00"
tags: 
---

#Docker 

ほぼこれの通り

[Docker Desktop for MacのHyperKit VMに入る](https://uzimihsr.github.io/post/2020-12-15-docker-desktop-for-mac-hyperkit-vm/)


```shell
$ docker run -it --rm --name volume-test-container -v test-volume:/volume_dir alpine:latest /bin/ash
```


```shell
$ docker inspect volume-test-container

[
    {
        "Id": "625a47db9275478db8235dc85f8711cc6a50fe5924f9e42f7f7ec23434f934e9",
        "Mounts": [
            {
                "Type": "volume",
                "Name": "test-volume",
                "Source": "/var/lib/docker/volumes/test-volume/_data",
                "Destination": "/volume_dir",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            },
        ],
    }
]

```


`/var/lib/docker/volumes/test-volume/_data` にあるのね、とlsしてみても、そんなディレクトリはないよと怒られる。
じゃあどこにあるのかというと、Docker Desktop for Macを使っている場合、Docker環境はHyperKitというVM(バーチャルマシン)上で実行されているためMacからは参照できない。
nsenter1というコマンドでVMに入って確認することができる。


