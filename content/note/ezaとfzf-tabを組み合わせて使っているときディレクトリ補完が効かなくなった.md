---
title: ezaとfzf-tabを組み合わせて使っているときディレクトリ補完が効かなくなった
date: 2023-11-07T10:03:00+09:00
tags:
  - shell
  - terminal
---


面白かったのでメモ

- [fzf-tab](https://github.com/Aloxaf/fzf-tab)
- [eza](https://github.com/eza-community/eza)

```sh
$ eza --version
eza - A modern, maintained replacement for ls
v0.15.2 [+git]
https://github.com/eza-community/eza
```

ll に以下のようなaliasを設定していた。
```sh
$ alias ll='eza -halF --icons'
```

ezaのバージョンをv0.15.2に上げたタイミングで、llを押してタブを押してディレクトリ補完をしようとしたら以下のような表示になり補完が効かなかった。

```shell
ll <TAB>
> _ 4/4 (0)
> always
  auto
  automatic
  never
```

原因が最初わからなかったが、cdやvimでは普通に補完されるのでllを疑ったところ、 `--icons` のあとに上で補完候補に表示された `always` `never` などの指定が必要になっていた。

```sh
$ alias ll='eza -halF --icons auto'
```

として解決した
