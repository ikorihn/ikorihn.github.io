---
title: minimistをラップしてkebab-caseのオプションをcamelCaseのフィールドに変換する処理を作った
date: 2024-06-27T18:22:00+09:00
tags:
  - TypeScript
---

[minimist](https://www.npmjs.com/package/minimist) は [[JavaScript]] でCLI引数をパースするときに便利なパッケージです

CLIオプションはlongオプションの場合 `--foo-bar` のように指定しますが、interfaceのpropertyで使用する際には `fooBar` とcamelCaseになっていたほうが気持ちがいいです。
それをするためのラッパー処理を書きました

```typescript
import minimist from "minimist";

type Kebab<T extends string, A extends string = ""> = T extends `${infer F}${infer R}`
  ? Kebab<R, `${A}${F extends Lowercase<F> ? "" : "-"}${Lowercase<F>}`>
  : A;

type KebabKeys<T> = Partial<{ [K in keyof T as K extends string ? Kebab<K> : K]: T[K] }>;
type Alias<T> = Partial<{ [K in keyof T as K extends string ? Kebab<K> : K]: string | string[] }>;
type IsRequired<T> = Partial<{ [K in keyof T as K extends string ? Kebab<K> : K]: boolean }>;

const toCamel = (str: string) => str.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace("-", "").replace("_", ""));

interface Opts<T> {
  alias?: Alias<T>;
  default?: KebabKeys<T>;
  required?: IsRequired<T>;
}

/**
 * kebab-caseで指定されたCLIオプションをcamelCaseのフィールドに変換する
 * e.g. `--base-path /work` は `basePath: "/work"` になる
 */
export function parseArgs<T extends minimist.ParsedArgs>(args: string[], opts?: Opts<T>): T {
  const al: { [key: string]: string | string[] } = {};
  if (opts?.alias != null) {
    for (const [k, v] of Object.entries(opts.alias)) {
      al[k] = v;
    }
  }

  const argv = minimist<T>(args, {
    alias: al,
    default: opts?.default,
  }) as T;

  if (opts?.required != null) {
    for (const k of Object.keys(opts.required) as (keyof KebabKeys<T>)[]) {
      const isRequired = opts.required[k];
      if (isRequired && argv[k] == null) {
        throw new Error(`required parameter [${String(k)}] is missing`);
      }
    }
  }

  let t: any = {};
  Object.keys(argv).forEach((k) => {
    t[toCamel(k)] = argv[k];
  });

  return t;
}
````

使い方

```typescript
interface Options {
  _: string[];

  workingDir: string;
  foo: string;
  no: number;
}

const args = parseArgs<Options>(process.argv.slice(2), {
  alias: {
    foo: ["f"],
    "working-dir": "w",
  },
  default: {
    foo: "bar",
    no: 1,
  },
  required: {
    "working-dir": true,
  },
});

console.log(JSON.stringify(args));
```
