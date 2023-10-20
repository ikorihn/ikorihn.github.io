---
title: tmuxでssh時に色を変える
date: 2021-09-09T20:04:00+09:00
tags:
- tmux
- shell
---

https://bacchi.me/linux/change-terminal-bgcolor/

````bash
function ssh() {
  # tmux起動時
  if [[ -n $(printenv TMUX) ]] ; then
      # 現在のペインIDを記録
      local pane_id=$(tmux display -p '#{pane_id}')
      # 接続先ホスト名に応じて背景色を切り替え
      if [[ `echo $1 | grep 'prd'` ]] ; then
          tmux select-pane -P 'bg=colour52,fg=white'
      elif [[ `echo $1 | grep 'stg'` ]] ; then
          tmux select-pane -P 'bg=colour25,fg=white'
      fi

      # 通常通りssh続行
      command ssh $@

      # デフォルトの背景色に戻す
      tmux select-pane -t $pane_id -P 'default'
  else
      command ssh $@
  fi
}
````
