---
title: Amazon SNSでSDKを使ってSMSを送信する
date: 2024-01-30T17:33:00+09:00
tags:
  - AWS
---

[[AmazonSNS]] でSMSを送信することができる。
SDKを使って送信する方法について記載する。

[Amazon SNS message publishing - Amazon Simple Notification Service](https://docs.aws.amazon.com/sns/latest/dg/sns-publishing.html)

マネコンから送信する方法についてはドキュメント参照

## 制限

1メッセージあたり140バイトまでという制限があり、これはエンコードごとに以下のような文字数になる。
- GMS 160文字
- ASCII 140文字
- UCS-2 70文字

この制限文字数を超えるメッセージはSNSが分割して送信する。機械的に140バイトで分割するのではなくて単語で区切ってくれるみたいだが、日本語は対応してない気がする。これも合計で1600バイトが制限となっている

## 電話番号の形式

電話番号は [E.164形式](https://www.nic.ad.jp/ja/basics/terms/E164.html) で指定する。
`+818012123434` のように国際番号+先頭の0を除いた番号となる

## aws-sdk-goで実装

[Publishing to a mobile phone - Amazon Simple Notification Service](https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html)

実装例に [[Go]] がないので書いてみる

```go
import (
	"context"
	"fmt"
	"regexp"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
)

var (
	digitsOnlyRegexp = regexp.MustCompile(`\D`)
	leadZeroRegexp   = regexp.MustCompile(`^0+`)
	countryCodeJp    = "81"
)

func FormatE164(number string) string {
	// 数字以外を記号含めて削除する
	number = digitsOnlyRegexp.ReplaceAllString(number, "")
	// 先頭の0を削除する
	number = leadZeroRegexp.ReplaceAllString(number, "")

	if !strings.HasPrefix(number, countryCodeJp) {
		number = countryCodeJp + number
	}
	number = "+" + number

	return number
}

func PublishSms(ctx context.Context, phoneNumber string, message string) (err error) {
	phoneNumberE164 := FormatE164(phoneNumber)

	input := sns.PublishInput{
		Message:     aws.String(message),
		PhoneNumber: aws.String(phoneNumberE164),
	}
	res, err := snsClient.PublishWithContext(ctx, &input) if err != nil {
		return fmt.Errorf("fail to send SMS: %w", err)
	}

	fmt.Printf("%s message sent", *res.MessageId)

	return nil
}
```

### attributeを指定する

送信者ID(SenderID)や送信者番号(OriginationNumber) など、コンソールから指定できる値はSDKでも指定できる。
`MessageAttributes` フィールドに指定するとよい。

```go
	input := sns.PublishInput{
		Message:     aws.String(message),
		PhoneNumber: aws.String(phoneNumberE164),
		MessageAttributes: map[string]*sns.MessageAttributeValue{
			"AWS.SNS.SMS.SenderID": {
				DataType:    aws.String("String"),
				StringValue: aws.String("theSenderID"),
			},
			"AWS.SNS.SMS.SMSType": {
				DataType:    aws.String("String"),
				StringValue: aws.String("Transactional"),
			},
		},
	}
```

- `AWS.SNS.SMS.SMSType`: `Promotional` か `Transactional` を指定可能
