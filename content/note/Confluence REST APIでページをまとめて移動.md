---
title: Confluence REST APIでページをまとめて移動
date: "2022-10-20T16:03:00+09:00"
tags: 
---

2022-10-20現在、Confluenceのページを一括で移動するような機能はないみたい

https://community.atlassian.com/t5/Confluence-questions/How-do-I-bulk-delete-or-move-pages-in-cloud-Confluence/qaq-p/1634378

なので作った

```shell
parent_page_id=$1
target_page_id=$2
child_pages=$(curl -u ${user_email}:${password} "${CONFLUENCE_BASE_URL}/content/${parent_page_id}/child/page")
echo $child_pages | jq -c '.results[]' | while read -r arr; do
  page_id=$(echo $arr | jq -r '.id')
  curl -u ${user_email}:${password} -XPUT "${CONFLUENCE_BASE_URL}/content/${page_id}/move/append/${target_page_id}"
done

```

ページのコピーはこちら
[[Confluence REST APIでページをコピー]]
