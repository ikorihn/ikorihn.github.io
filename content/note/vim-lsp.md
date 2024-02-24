---
title: vim-lsp
date: "2020-09-20T15:21:00+09:00"
tags: ['vim', 'lsp']
---

vim-lsp
===========

- ale.vim
    - lintエンジン
    - lspクライアント
- prabirshrestha/vim-lsp
    - lspクライアント
- mattn/vim-lsp-settings
    - vim-lspの設定をかんたんにする
    - language serverのインストールを `:LspInstallServer` `:LspUninstallServer` で行う
    - ```
        hook_add = '''
        let g:lsp_settings = {}
        let g:lsp_settings_filetype_go = ['gopls', 'golangci-lint-langserver']
        let g:lsp_settings['gopls'] = {
            \  'workspace_config': {
            \    'usePlaceholders': v:true,
            \  },
            \  'initialization_options': {
            \    'usePlaceholders': v:true,
            \  },
            \}
        '''
    ```
- prabirshrestha/asyncomplete.vim
    - 補完プラグイン
- prabirshrestha/asyncomplete-lsp.vim
    - lsp用の補完
    - ```
        [[plugins]]
        repo = 'prabirshrestha/asyncomplete.vim'
        
        [[plugins]]
        repo = 'prabirshrestha/asyncomplete-lsp.vim'
        on_ft = ['python', 'go']
        depends = ['asyncomplete.vim', 'vim-lsp']
    ```
- スニペット補完
    - prabirshrestha/asyncomplete-ultisnips.vim
    - SirVer/ultisnips
    - hona/vim-snippets

## LSP Language Server Protocol
- IDEみたいな機能を提供するサーバー


## Link

- [[fzf.vimの使い方]]
- [[vim 使っているplugin]]
