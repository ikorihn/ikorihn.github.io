---
title: Confluence REST APIでページをコピー
date: 2022-10-20T15:19:00+09:00
tags: null
---

\#confluence

定期開催されるミーティングの議事録を作るのを簡略化したかった。
前回の議事録をコピーして追記していくスタイルだったため、
あるページ配下の最新のページ(=前回の議事録)をコピーしてタイトルを変えるスクリプトをREST APIを使って作った。

https://developer.atlassian.com/cloud/confluence/rest/v1/api-group-content---children-and-descendants/#api-wiki-rest-api-content-id-copy-post

````shell
function copy_latest_page() {
  local parent_page_id=$1
  local page_title=$2

  # parent_page配下の最新のページタイトル、IDを取得 (ページネーションは考えず雑に)
  local previous_page=$(curl -u ${user_email}:${password} "https://${YOUR_CONFLUENCE_DOMAIN}/wiki/rest/api/content/${parent_page_id}/child/page" | jq -r '.results[] | .title + "," + .id' | sort | tail -n 1)
  local previous_page_id=$(echo $latest_page | cut -d ',' -f 2)
  if [[ -z "${previous_page_id}" ]]; then
    echo "previous page is not found"
    exit 1
  fi

  local copy_body=$(cat << EOS
{
  "pageTitle": "${page_title}",
  "copyAttachments": true,
  "destination": {
    "type": "parent_page",
    "value": "${parent_page_id}"
  }
}
EOS
  )
  copy_body=$(echo $copy_body | jq -c)

  local copy_result=$(curl -u ${user_email}:${password} -XPOST -f -H 'X-Atlassian-Token: no-check' -H 'Content-Type: application/json' "https://${YOUR_CONFLUENCE_DOMAIN}/wiki/rest/api/content/${previous_page_id}/copy" -d "${copy_body}" )

  local retval=$?

  # copyAttachments=true にすると画像が多いページではコピーに時間がかかりタイムアウトするので、その場合はコピー完了したかをポーリングで確認する
  if [[ ! $retval -eq 0 || -z $copy_result ]]; then
    i=0
    while [[ $i -lt 10 ]]; do
      echo "waiting... $i"
      local latest_page=$(curl -u ${user_email}:${password} "https://${YOUR_CONFLUENCE_DOMAIN}/wiki/rest/api/content/${parent_page_id}/child/page" | jq -r '.results[] | .title + "," + .id' | sort | tail -n 1)
      local latest_page_title=$(echo $latest_page | cut -d ',' -f 1)
      local latest_page_id=$(echo $latest_page | cut -d ',' -f 2)

      if [[ "${latest_page_title}" = "${page_title}" ]]; then
        copied_page_id=${latest_page_id}
        break
      fi
      
      sleep 30s
      i=$((i+1))
    done

  else
    copied_page_id=$(echo $copy_result | jq -r '.id')
  fi


  echo "Copied from '${previous_page_id}' -> '${copied_page_id}' (parent: '${parent_page_id}')"
}

````

* 簡単にBasic認証にした。OAuth等も使える
* 添付ファイルの多いページでコピーに時間がかかりタイムアウトする部分の解決が一番苦労した。タイムアウト値は設定できそうになかったので、作成されたかを何回か見に行く方式を取った。ブラウザ上でページをコピーしてもやはり時間がかかるので、添付ファイルが多い場合は注意が必要だ
