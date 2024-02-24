---
title: Go Ginに入門してみる
date: "2022-12-13T15:13:00+09:00"
tags:
  - 'Go'
lastmod: "2022-12-18T13:55:00+09:00"
---

#Go

[Quickstart | Gin Web Framework](https://gin-gonic.com/docs/quickstart/)

```shell
go get -u github.com/gin-gonic/gin
```

`main.go`

```go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080
}
```

### Graceful shutdownを実装する

<https://gin-gonic.com/docs/examples/graceful-restart-or-stop/>

[[Go http.ServerのGraceful shutdown]]

### middleware

middlewareには `gin.HandlerFunc` を実装している関数を渡す

```go
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		defer func() {
			elapsed := time.Since(t)
			fmt.Printf("elapsed: %v\n", elapsed)

		}()

		c.Next()
	}
}

func main() {
	r := gin.New()
	r.Use(Logger())

	r.GET("/test", func(c *gin.Context) {
		example := c.MustGet("example").(string)

		// it would print: "12345"
		log.Println(example)
	})

	// Listen and serve on 0.0.0.0:8080
	r.Run(":8080")
}

```
