---
title: Hystrix dashboard
date: 2023-05-05T20:32:00+09:00
tags:
- 監視
---

https://github.com/Netflix-Skunkworks/hystrix-dashboard/wiki

````
git clone https://github.com/cep21/circuit.git
cd circuit
make run

docker run -d -p 7979:9002 --name hystrix-dashboard mlabouardy/hystrix-dashboard:latest
````

http://127.0.0.1:7979/hystrix

http://host.docker.internal:8123/hystrix.stream を追加する

こんなダッシュボードが見れる

![Pasted-image-20221118112314](note/Pasted-image-20221118112314.png)
