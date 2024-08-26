---
title: Boomerでイベントを受け取ってcallbackを実行させる
date: 2024-07-23T14:52:00+09:00
tags:
  - Locust
---
 
[[Locust]] と [[LocustとBoomerを使ってGoで負荷試験のスクリプトを書く|Boomer]] で負荷試験を行う際、LocustのGUIでターゲットのURLを変更しても、通常はBoomer側には反映されません。
そこでGUIでユーザー数やURLを変更したタイミングで、イベントを受け取れるようにできないかを調べました。

## イベントをSubscribeする

こちらの例のように書くことで、各イベント発火時に実行されるcallbackを定義することができます。

https://github.com/myzhan/boomer/blob/master/_examples/events/subscriber.go


```go
package main

import (
	"log"
	"time"

	"github.com/myzhan/boomer"
)

// This is an example about how to subscribe to boomer's internal events.

func foo() {
	start := time.Now()
	time.Sleep(100 * time.Millisecond)
	elapsed := time.Since(start)

	boomer.RecordSuccess("http", "foo", elapsed.Nanoseconds()/int64(time.Millisecond), int64(10))
}

func main() {
	boomer.Events.Subscribe(boomer.EVENT_CONNECTED, func() {
		log.Println("The master sends an ack message")
	})

	boomer.Events.Subscribe(boomer.EVENT_SPAWN, func(workers int, spawnRate float64) {
		log.Println("The master asks me to spawn", workers, "goroutines with a spawn rate of", spawnRate, "per second.")
	})

	boomer.Events.Subscribe(boomer.EVENT_STOP, func() {
		log.Println("The master asks me to stop.")
	})

	boomer.Events.Subscribe(boomer.EVENT_QUIT, func() {
		log.Println("Boomer is quitting now, may be the master asks it to do so, or it receives one of SIGINT and SIGTERM.")
	})

	task := &boomer.Task{
		Name:   "foo",
		Weight: 10,
		Fn:     foo,
	}

	boomer.Run(task)
}
```

あらかじめ定義されているイベントは以下のとおりです。

https://github.com/myzhan/boomer/blob/07b7994517513a29ab740e0029b21d0b198fcdff/events.go

```go
	EVENT_CONNECTED = "boomer:connected"
	EVENT_SPAWN     = "boomer:spawn"
	EVENT_STOP      = "boomer:stop"
	EVENT_QUIT      = "boomer:quit"
```

`EVENT_SPAWN` であれば、Locustからspawnのメッセージを受け取ったあとの処理のなかで発火されています。
引数に2個指定されているので、callbackも2個の引数を受け取るfuncとなります。

https://github.com/myzhan/boomer/blob/07b7994517513a29ab740e0029b21d0b198fcdff/runner.go#L250

## カスタムイベント

自分で定義したイベントを送受信することもできます。

https://github.com/myzhan/boomer/tree/master/_examples/custom_message

```go
boomer.Events.Subscribe("user_defined", func(msg *boomer.CustomMessage) {
	log.Printf("Custom message recv: %v\n", msg)

	// Avoid doing lots of type casting between python and go, we stringify data before sending to boomer.
	data, ok := msg.Data.([]byte)
	if !ok {
		log.Println("Failed to cast msg.data to []byte")
	} else {
		log.Printf("data: %s", string(data))
	}
	globalBoomer.SendCustomMessage("acknowledge_users", "Thanks for the message")
})
```

`locustfile.py` で `send_message` にシリアライズしたメッセージを送信することで、Boomer側で受け取ることができます。

```python
for i, worker in enumerate(environment.runner.clients):
    environment.runner.send_message('user_defined', json.dumps(message_body), worker)
```
