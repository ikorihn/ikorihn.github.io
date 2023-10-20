---
title: aws cli filterとqueryのメモ
date: 2023-05-05T20:30:00+09:00
tags:
- AWS
- CLI
---

## autoscaling describe-auto-scaling-groups

https://docs.aws.amazon.com/ja_jp/autoscaling/ec2/userguide/ec2-auto-scaling-tagging.html#use-tag-filters-aws-cli
https://docs.aws.amazon.com/cli/latest/reference/autoscaling/describe-auto-scaling-groups.html

こちらのような形式でfilterできる。
ワイルドカードが使えないので注意(1敗)

````
--filters Name=tag:`environment`,Values=`production`
````

````shell
# ワイルドカード指定は効果がない
aws autoscaling describe-auto-scaling-groups --filters 'Name=tag:Name,Values=`*myvalue*`'

# filtersとqueryの組み合わせはできる
aws autoscaling describe-auto-scaling-groups --filters "Name=tag:Group,Values=`${Group}`" \
  --query "AutoScalingGroups[? (Tags[? (Key=='Name' && contains(Value, 'myvalue') && \
        !(starts_with(Value, 'foo') && starts_with(Value, 'bar')) \
        ) ] ) ] \
      .{ AutoScalingGroupName: AutoScalingGroupName,MaxSize: MaxSize, MinSize: MinSize, DesiredCapacity: DesiredCapacity}"


# この書き方は正しく無いみたいで、containsで書いているのに完全一致しか検索できなかった
aws autoscaling describe-auto-scaling-groups --query 'AutoScalingGroups[?contains(Tags[?Key==`Name`].Value, `myvalue`)]' 
````

queryだけでも絞り込みできるが、filtersと組み合わせた場合に比べて時間がかかっていた。
内部的には、queryはすべて取得してから絞り込み、filterは前処理で絞り込むんでいるのかな？

## queryについて

JMESPathの記法で絞り込んだりフィールドの抽出を行う。

* [JMESPath — JMESPath](https://jmespath.org)

* [JMESPath Examples — JMESPath](https://jmespath.org/examples.html)

* [AWS CLIのクエリの使い方 - karakaram-blog](https://www.karakaram.com/aws-cli-query-usage/)

* [amazon web services - AWS-CLI: Ways to list down autoscalinggroups - Stack Overflow](https://stackoverflow.com/questions/43213828/aws-cli-ways-to-list-down-autoscalinggroups/43213944)

* [amazon cloudformation - JMESPath JSON filter with multiple matches - Stack Overflow](https://stackoverflow.com/questions/37945318/jmespath-json-filter-with-multiple-matches)

* [JmesPath find where not exists - Stack Overflow](https://stackoverflow.com/questions/42396971/jmespath-find-where-not-exists)

* [I want to filter instances by matching a substring of a tag value · Issue #2206 · aws/aws-cli · GitHub](https://github.com/aws/aws-cli/issues/2206)
