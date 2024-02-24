---
title: fzf.vimの使い方
date: "2020-09-19T20:36:00+09:00"
tags: ['vim', 'shell']
---

## fzf
https://github.com/jethrokuan/fzf#usage
- `FZF_DEFAULT_COMMAND` でfzf実行時に使用するコマンドを指定
- ripgrep が高速なのでこんな風にするといい `FZF_DEFAULT_COMMAND=rg --hidden -g "!.git/*" -l ""`
- `FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'` で、`ctrl-t` を押すとfzfが実行される
- `FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {}"'` プレビューオプション

## fzf.vim
- Rgの結果をquickfixに送る
  - https://github.com/junegunn/fzf.vim/issues/586
  - `shift` や `alt-a` `alt-d` で全選択・解除してEnter
  - QuickFix の操作は `:cp` や `:cn`、ウィンドウを開くのは `:cwindow` `:cclose`
- Filesの結果は `shift` でしか選択できない

```
[[plugins]]
repo = 'junegunn/fzf.vim'
depends = ['fzf']
on_cmd = [
  'Files',
  'GFiles',
  'GFiles?',
  'Tags',
  'Commands',
  'Rg',
  'History',
  'Buffers',
]
hook_add = '''
    command! -bang -nargs=* Rg
        \ call fzf#vim#grep(
        \   'rg --column --line-number --hidden --no-heading --color=always --smart-case -g "!.git/*" -- '.shellescape(<q-args>), 1,
        \   fzf#vim#with_preview(), <bang>0)

    fun! FzfOmniFiles()
        let is_git = system('git status')
        if v:shell_error
            :Files
        else
            :GFiles
        endif
    endfun

    nnoremap <C-j><C-j> :Commands<CR>
    nnoremap <C-j><C-h> :History<CR>
    nnoremap <C-j><C-p> :call FzfOmniFiles()<CR>
    nnoremap <C-j><C-g> :Rg<Space>
    nnoremap <C-j><C-b> :Buffers<CR>
    nnoremap <C-j>. :<C-u>Files ~/.dotfiles<CR>
'''
```
