---
title: Go ターミナルのプロンプトでpasswordを入力する
date: '2023-04-26T12:10:00+09:00'
tags:
  - '2023/04/26'
  - 'Go'
---

ターミナル上でパスワードを入力するとき、画面上には表示されないようにしたい。

そんなときに [golang.org/x/crypto の ssh/terminal](https://pkg.go.dev/golang.org/x/crypto) が使える

```go
func askCred() (string, string) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter Username: ")
	username, _ := reader.ReadString('\n')

	fmt.Print("Enter Password: ")
	bytePassword, err := terminal.ReadPassword(0)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("\nPassword typed: " + string(bytePassword))
	password := string(bytePassword)

	return strings.TrimSpace(username), strings.TrimSpace(password)
}
```
