---
title: zxで環境変数を利用する
date: 2024-03-21T19:19:00+09:00
tags:
  - TypeScript
---
 
[[google zx]] の `$` で呼び出すprocess内で環境変数を使用したり、使用するための環境変数をセットしたい。

## だめなパターン

`$` で `export FOO` しても、サブプロセス同士では共有されないため後続で参照することができない。

```typescript
import { $ } from "zx";

await $`export MYENV=foo`;
await $`echo $MYENV`;
```

```
bash: line 1: MYENV: unbound variable
```

## 良いパターン

### スクリプト実行前にshellでセットする

```typescript
import { $ } from "zx";

await $`echo $MYENV`;
```

```shell
❯ MYENV=foo ./tmp.ts
$ echo $MYENV
foo
```

### スクリプト内でprocess.envにセットする

```typescript
import { $ } from "zx";

process.env.MYENV = "foo";
await $`echo $MYENV`;
```

```shell
❯ MYENV=foo ./tmp.ts
$ echo $MYENV
foo
```

### コマンド行の先頭で変数をセットする

`process.env` はglobalなのでそこを汚したくない場合は、shellのコマンドラインの先頭にセットする方法を使う。
[shell - How do I set an environment variable on the command line and have it appear in commands? - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/56444/how-do-i-set-an-environment-variable-on-the-command-line-and-have-it-appear-in-c)

```typescript
import { $ } from "zx";

const FOO = "foo";
await $`MYENV=${FOO} bash -c 'echo $MYENV'`;
await $`MYENV=${FOO} some-application`;

// これはだめ(shell上でも同様)
await $`MYENV=${FOO} echo $MYENV`;
```