---
title: Go cognitoのjwtを検証する
date: "2022-09-16T12:26:00+09:00"
tags: 
---

#Go 

CognitoのJWTの検証は公式ドキュメントの通りに行う
[JSON web トークンの検証 - Amazon Cognito](https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)


今回は https://github.com/lestrrat-go/jwx を使う

```go
import (
	"context"
	"fmt"

	"github.com/lestrrat-go/jwx/jwk"
	"github.com/lestrrat-go/jwx/jwt"
)

func ValidateJwt(tokenString string) error {

	fmt.Printf("%v\n", tokenString)

    // jwkを取得する
	keySet, err := jwk.Fetch(context.Background(), fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", "region", "userId"))
	if err != nil {
		return err
	}

    // 検証
	token, err := jwt.Parse([]byte(tokenString), jwt.WithKeySet(keySet), jwt.WithValidate(true))
	if err != nil {
		fmt.Printf("%v\n", err)
		return err
	}

    // aud の値がcliend_idと一致するか検証
	if token.Audience()[0] != "my_client_id" {
		return ErrClientId
	}
    // iss の値がuserpool_idと一致するか検証
	if token.Issuer() != "userpoolId" {
		return ErrClientId
	}
    // token_use の値がaccessか検証
	if tokenUse, ok := token.Get("token_use"); ok {
		if tokenUseStr, ok := tokenUse.(string); ok && tokenUseStr != "access" {
			return ErrTokenUse
		}
	}
	return nil


	return nil
}

```
