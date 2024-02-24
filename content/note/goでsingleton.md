---
title: goでsingleton
date: "2021-07-02T17:59:00+09:00"
lastmod: '2021-07-02T17:59:26+09:00'
tags:
  - 'Go'

---

#Go

[How singleton pattern works with Golang | by Jefferson Otoni Lima | Golang Issue | Medium](https://medium.com/golang-issue/how-singleton-pattern-works-with-golang-2fdd61cd5a7f)
[Go 言語における Singleton Pattern | text.Baldanders.info](https://text.baldanders.info/golang/singleton-pattern/)

## よくやるやつ

なにも考えずにつくるとこうなる

```go
var instance *Config

func GetInstance() *Config {
    if instance == nil {
        instance = &Config{}
    }
    return instance
}
```

これはスレッドセーフではないので、instanceの生成処理に時間がかかる場合にgoroutineなどで同時にアクセスすると、
複数回生成実行される

=> Singletonでない

## 解決策

`sync.Once` か `sync.Mutex` を使うといい

```go
var instance *Config
var once sync.Once

func GetInstance() *Config {
	once.Do(func() {
		instance = NewConfig()
	})
	return instance
}
```
