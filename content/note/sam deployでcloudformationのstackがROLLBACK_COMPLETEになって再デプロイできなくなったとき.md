---
title: sam deployでcloudformationのstackがROLLBACK_COMPLETEになって再デプロイできなくなったとき
date: 2022-07-06T14:32:00+09:00
tags: null
---

\#sam #AWS 

sam deploy(cloudformation deploy)に失敗したときに、以下のようなメッセージがでて再実行してもエラーになる

````
Error: Failed to create/update the stack: <stack_name>, Waiter StackCreateComplete failed: Waiter encountered a terminal failure state: For expression "Stacks[].StackStatus" we matched expected path: "ROLLBACK_COMPLETE" at least once
````

この場合はstackを削除する

````shell
aws cloudformation delete-stack --stack-name <stack_name>
````

## 2回目以降の実行で、UPDATE_ROLLBACK_FAILED状態のままになっている場合

[UPDATE_ROLLBACK_FAILED 状態のままになっている CloudFormation スタックを更新する](https://aws.amazon.com/jp/premiumsupport/knowledge-center/cloudformation-update-rollback-failed/)

rollbackを続行する

````shell
aws cloudformation continue-update-rollback --stack-name <stack_name>
````
