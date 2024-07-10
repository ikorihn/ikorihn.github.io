---
title: Docker container同士のファイル差分を出力する
date: 2024-07-10T16:29:00+09:00
tags:
  - Docker
---
 
{{< card-link "https://github.com/GoogleContainerTools/container-diff" >}}

2024年現在はアーカイブされており、 https://github.com/reproducible-containers/diffoci を使うよう案内されている

```
❯ diffoci diff --platform=linux/arm64 --semantic public.ecr.aws/docker/library/alpine:3.18 public.ecr.aws/docker/library/alpine:3.19
INFO[0000] Target platforms: [linux/arm64]
INFO[0000] Pulling "public.ecr.aws/docker/library/alpine:3.18" for additional platforms ([linux/arm64])
public.ecr.aws/docker/library/alpine:3.1        saved
└──index (1875c923b734)                         already exists
   └──manifest (879b9c82d5a8)                   complete        |++++++++++++++++++++++++++++++++++++++|
      ├──layer (5c905c7ebe2f)                   complete        |++++++++++++++++++++++++++++++++++++++|
      └──config (dec292d02e07)                  complete        |++++++++++++++++++++++++++++++++++++++|
Completed pull from OCI Registry (public.ecr.aws/docker/library/alpine:3.18)    elapsed: 2.6 s  total:  3.2 Mi  (1.2 MiB/s)
INFO[0002] Pulling "public.ecr.aws/docker/library/alpine:3.19" for additional platforms ([linux/arm64])
public.ecr.aws/docker/library/alpine:3.1        saved
└──index (af4785ccdbcd)                         already exists
   └──manifest (cc8129666469)                   complete        |++++++++++++++++++++++++++++++++++++++|
      ├──layer (d4f2d2bd5ed9)                   complete        |++++++++++++++++++++++++++++++++++++++|
      └──config (15a7f8901421)                  complete        |++++++++++++++++++++++++++++++++++++++|
Completed pull from OCI Registry (public.ecr.aws/docker/library/alpine:3.19)    elapsed: 1.6 s  total:  3.2 Mi  (2.0 MiB/s)
TYPE     NAME                                 INPUT-0                                                                         INPUT-1
File     usr/lib/engines-3/capi.so            eaab9dd179ead9cdd3281902311559cbca1dbf3f9d3d17d4d6f2cf1456d5bca5                16162be6ce453d9163a0d5757ba1d3e7340436524576cd5ac0990b451e25d8f6
File     etc/issue                            774e6ac5abc275013a07cba05be43f0953cf759f852d177aa25f27ff62ab2eb4                60745a389bc7808d358385658c786d6dbddd71021b8cab4355daea040688f4cf
File     usr/lib/ossl-modules/legacy.so       af87c2d67220b0add0643d0ff62b9fb215183ea95809db965e2f8ee2654d1433                79f7b0d6e7a62051dabf0421c5fc64c1025f8c81f5e95f9c3a5d0416d07f248f
File     lib/apk/db/triggers                  eba93f45ad87e39896d53fbdb66e0c47df08bdacd0cd7881ad2e6b42b48e3d16                f3eca348c5b457276f82f6c12052ea0878444c4b9bb7c8446b1925e4ecb5bd59
File     usr/lib/engines-3/padlock.so         c4553b94227f64adf688019e18ad5e316450a46d7b7514c3367f094707c0ac91                88c02f3f19b6b4bb59a3c30dbf9881ad2f3dd5f22f211b43dd75d2fec8486252
File     lib/libapk.so.2.14.0                 6798e460e473260c372ad91cd43cb214114c201e3a763c8c40229660cda32946                e49d51159adcca9cc534c3ccda5195bac269fd300f0d5de619770501c522ce1c
File     etc/secfixes.d/alpine                710e8bcd58a32e4896e18d239820978c43f4d607415516917f0a23932c31ce65                939d167efb5eed4153fdae2b9f38e18dcd5c53934dbb5f7a97bcc3d0e27157f8
File     lib/apk/db/scripts.tar               571f2e0705cf4c6f534143e3e84a55b14fa023eed294a3492e8b55f838808a06                503d14f6de81c709baa8672b9d23e1d9485097e537b46d7d3ac4d9b4c2cec22f
File     etc/profile                          d60bb14d0da6fa0ce9783dbfdcd440d219c9b556d0bdfd519890010c5d1df48c                87e8643d3ce156de0c09370d4d39446f30bd00d264bea248abc191c4d7b9df3e
File     etc/securetty                        49382575069e4b954a36f1fb2248d1bd96ee7ba28a5b12798fa92d80a29d0fab                713fcea5109728883b9147e822429133fcc8b5e253afd3c2a197b10cd0bc3b4d
File     usr/bin/scanelf                      7081035636412d3596a8b7f1a9191d2b8833bcd952908d7fcc4bb98205ee0419                c30d03b9a23933abaaccd78533d8bc02aa4e987ca4118f52f07ebbc78ba97957
File     etc/apk/repositories                 293ab007ea57d023c3418a8063966a40407ceb90517e60ad710772c70694f9c5                8672eb6fb0740805ea01fd105ffd6f76b3594e0763a786a768fc2374379d54c7
File     etc/alpine-release                   f4cd26bf51cc2533131c09d1538217484f0288590383bdf309a9be50f69a8692                4df2a8d73bbc18e9fd2f0159599b77632c648145cf532cce4b41600799da096a
Layer    ctx:/manifests-3/layers-0/layer      name "etc/apk/protected_paths.d/alpine-release.list" only appears in input 0
File     usr/bin/iconv                        49571b0ff10fce6c5760649fa9ce475a28358f34e690e126151a6005cab65db6                0ef5bb0437928f5e854a8b133390ec25b8cb25283f8b334cc96c7bbc865df61e
File     usr/lib/engines-3/afalg.so           d06c5b67a44f555af9b911f8a4c4fab59ddefa98abf493875dadc4097850dd63                d795a676a0e38de4ae0034f644056839872ce0372af8160cf506d37f2ca14549
File     usr/bin/ssl_client                   3a9df6d59c09ccb1d6058189ab18fc4a8e28198737c53401ff88fddbf1d300a5                b3cae7b46e554d9dace810fec5dba8c719c20b12d01c96192fd70a7438206f58
File     lib/ld-musl-aarch64.so.1             3628085dc7a8968f4bce76c8ebedbd55feb527a4cf577e4ed7896865f6199dd9                6adb0483a7f04e5afa6dcbf4183b0eeba2458c0595d11314bd7f5c5d1fb82699
Layer    ctx:/manifests-3/layers-0/layer      name "bin/ed" only appears in input 0
File     lib/libssl.so.3                      e57d336561a1c9a675954b09ec462f458c2b20f1253607895e7027fa2047fd3e                e719641a6dbeda29cf1a1a9a3ef8fe202e14116490d51305669240d1cac1f8bc
Layer    ctx:/manifests-3/layers-0/layer      name "lib/libz.so.1.2.13" only appears in input 0
File     etc/busybox-paths.d/busybox          51cfbbdc27b1524bfce7aff217f7a82327ce6d441f43ce0eadfc6d30852104a5                e12e0822f5c6426b62f07799a0fc20394241535c5bc2cc8f10c8a25088b8defa
File     usr/bin/getconf                      2ed5b391dbde6659b05e56ccd79d0295660c934334ad6ff4e60be32beed0441f                9239f3403ba6d4bb8ee4b80cc09fbefd4beccfeadfb936c5427019a5aa10102b
File     sbin/apk                             59896ac4077636896e20061ba8db21d3b8e2e92f570c64aba13150434329692a                92f56e09af6a29fef58f9527ce10a49cf056154c828ec833bb78445733202a88
File     usr/lib/engines-3/loader_attic.so    9b4a552b4a2627925ae0366cc0c75d3866c01620e032ad131154f3ea942cda2e                392d89492c9478131e419c668a0bd759a848a494c073c4cdd0623aa738f5e8c6
File     lib/apk/db/installed                 55729e44df0af5e02a1d94dc0885cdc19feb1a87b190489a7a2d65b5b24af418                9eb4bf4ccf4ac20ff530e6e45ddf168b090343a7b1bd27c2bf680d336bbabf67
File     bin/busybox                          33f658499cbba253de4aa27226fc052fe739f628cc8aacc4b26317d5e9d2f4ef                0ea1a665174856678ef39760c9b90670308c1d86bde261b2fa06d18c5fb824c4
File     etc/os-release                       c93c43b23f3790a893c652ee8c4f819698b0df312b8080e7d741b46b1a60841a                d1f2aeb04f125e370b1611a90e69403c4613723ffb421454f4ddd4eb841ecaef
File     lib/libz.so.1                        Linkname libz.so.1.2.13                                                         Linkname libz.so.1.3.1
File     usr/bin/getent                       8d1a7af6ccafb155c11a02f02c07805a6b54b71ac3f99a2fde2476e0304d2558                7075fbb5d270882278dd158a0573f5ba2196314e1b86b7691e5be5cd3133ed60
File     lib/libcrypto.so.3                   499d8d648cda8c7dc4640c60675a74af57af41ec72c2a2cbe5d84b828058660b                3df8b7afb869157e0d94d2c34bf53380ab7d0a55d12717510e436ad549c19939
Layer    ctx:/manifests-3/layers-0/layer      name "etc/udhcpc/" only appears in input 1
Layer    ctx:/manifests-3/layers-0/layer      name "lib/libz.so.1.3.1" only appears in input 1
Layer    ctx:/manifests-3/layers-0/layer      name "etc/udhcpc/udhcpc.conf" only appears in input 1
```