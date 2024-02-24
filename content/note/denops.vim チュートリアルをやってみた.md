---
title: denops.vim チュートリアルをやってみた
date: 2023-10-01T15:52:00+09:00
tags:
  - vim
  - Neovim
  - Deno
---

https://github.com/vim-denops/denops.vim でDenoを使ったvimプラグインを作ってみる。

## インストール

{{< card-link "https://vim-denops.github.io/denops-documentation/install.html" >}}

- [[Deno]] を公式の手順で入れるか、asdf(rtx)でインストールする。
- `vim-denops/denops.vim` プラグインを追加する

## チュートリアル

https://vim-denops.github.io/denops-documentation/tutorial.html

プラグイン用のディレクトリを作成する

```shell
mkdir ~/my-first-denops
mkdir -p ~/my-first-denops/denops/helloworld
touch ~/my-first-denops/denops/helloworld/main.ts
```

```lua
vim.opt.runtimepath:append("~/my-first-denops")
vim.g["denops.debug"] = 1
```

プラグインの中身を書く

```typescript:denops/helloworld/main.ts
import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v0.1.1/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async echo(text: unknown): Promise<unknown> {
      ensureString(text);
      return await Promise.resolve(text);
    },
  };

  await execute(
    denops,
    `command! -nargs=1 HelloWorldEcho echomsg denops#request('${denops.name}', 'echo', [<q-args>])`,
  );
};
```

vimを開き直して、 `:HelloWorldEcho Hello Denops!` を実行するとコンソールに `Hello Denops!` が出力される

## 感想

書き慣れたTypeScriptで補完を効かせながら書けるので便利そう。

LSPでdenolsとtsserverを入れていると*.tsに対してtsserverが実行されてしまい、うまく補完されなかったので切り替えられるようにした -> [[Neovim mason-lspconfigでdenolsとtsserverを切り替える]]]
