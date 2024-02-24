---
title: Go OSのcredential管理を利用する
date: '2023-04-26T12:06:00+09:00'
tags:
  - '2023/04/26'
  - 'Go'
---

パスワードを使用するツールを作っていて、設定ファイルにパスワードを書きたくなかったため、GoでOSの管理ツールに保存、取得する方法を調べた。

MacであればKeychain、WindowsであればCredential Managerがある
https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac
https://support.microsoft.com/en-us/windows/accessing-credential-manager-1b5c916a-6a16-889f-8581-fc16e8165ac0

## ライブラリ

[zalando/go-keyring: Cross-platform keyring interface for Go](https://github.com/zalando/go-keyring/tree/master) が良さそう。

Linux含め各OSに対応していて、OS Xは `/usr/bin/security` (OS X keychain のインターフェース)、Windowsは https://github.com/danieljoos/wincred を使用している

## 実装

credentialを取得して、未指定であれば入力を促すようにした。

パスワードの入力はこちらを使用する
[[Go ターミナルのプロンプトでpasswordを入力する]]

```go
func getPassword(service, username string) (string, error) {
	// get password
	secret, err := keyring.Get(service, username)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			fmt.Print("Enter Password: ")
			bytePassword, err := terminal.ReadPassword(0)
			if err != nil {
				return "", err
			}
			fmt.Println()
			p := strings.TrimSpace(string(bytePassword))
			if p == "" {
				return "", errors.New("password should not be empty")
			}

			err = keyring.Set(service, username, p)
			if err != nil {
				return "", err
			}

			return p, nil
		} else {
			return "", err
		}
	}

	return secret, nil
}
```
