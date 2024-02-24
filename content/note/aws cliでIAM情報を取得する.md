---
title: aws cliでIAM情報を取得する
date: "2022-12-26T19:11:00+09:00"
lastmod: "2022-12-26T19:11:00+09:00"
tags:
  - 'AWS'
---

#AWS

[【AWS CLI】IAM関連の情報取得編 - サーバーワークスエンジニアブログ](https://blog.serverworks.co.jp/aws-cli-iam)

```shell
function describe_role() {
  local role=$1

  echo "---- Role[$role] ----"

  if ! aws iam get-role --role-name ${role} >/dev/null; then
    error "IAM Roleが存在しません: ${role}"
    exit 1
  fi

  # インラインポリシー以外
  policies=$(aws iam list-attached-role-policies --role-name $role --query "AttachedPolicies[].[PolicyArn]" --output text)
  echo "[$role] Policies:"
  echo "$policies"
  for policy in $policies; do
    echo "[$role] PolicyName: $policy"
    policy_version=$(aws iam get-policy --policy-arn $policy --query "Policy.DefaultVersionId" --output text)
    aws iam get-policy-version --policy-arn $policy --version-id $policy_version --query "PolicyVersion.Document.Statement"
  done

  # インラインポリシー
  inline_policies=$(aws iam list-role-policies --role-name $role --query "PolicyNames" --output text)
  echo "[$role] InlinePolicies:"
  echo "$inline_policies"
  for policy in $inline_policies; do
    echo "[$role] InlinePolicyName: $policy"
    aws iam get-role-policy --role-name $role --policy-name $policy --query "PolicyDocument"
  done
}
```
