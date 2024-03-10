---
title: boto3 assume-roleで取得したcredentialでリソースにアクセスする
date: 2024-02-27T18:49:00+09:00
tags:
  - Python
  - AWS
---

[[AWS SDK for JavaScript v3 でassume-roleで各リソースにアクセスするクライアントを作る]] みたいに簡単にやれないか調べた。

## 結論

ラッパーはなさそう。

[Python Boto3 auto-refresh credentials when assuming role | AWS re:Post](https://repost.aws/questions/QU-tAtxo2uQp-10bHXHccyTg/python-boto3-auto-refresh-credentials-when-assuming-role)

## 代替策

[Refreshable Boto3 Session](https://pritul95.github.io/blogs/boto3/2020/08/01/refreshable-boto3-session/) や [How to refresh the boto3 credentials when python script is running indefinitely - Stack Overflow](https://stackoverflow.com/questions/63724485/how-to-refresh-the-boto3-credentials-when-python-script-is-running-indefinitely) で紹介されているような自動でリフレッシュするクライアントを自作する感じらしい

`botocore.credentials.RefreshableCredentials` を使っている。
[Auto-refresh AWS Tokens Using IAM Role and boto3 - DEV Community](https://dev.to/li_chastina/auto-refresh-aws-tokens-using-iam-role-and-boto3-2cjf) でも解説されているが、ドキュメントされていないので公式の推奨ではないのだろうか…？

pytzは使わず datetime.timezone.utc で良さそう
