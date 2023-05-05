---
title: TypeScriptのドメインオブジェクトについて
date: 2023-05-05T20:31:00+09:00
tags:
- TypeScript
---

## [TypeScript](note/TypeScript.md) のドメインオブジェクトについて

classで定義してgetterのみ公開ってしたけど、これは失敗だった

````
export class Animal {
	constructor(
		private _name: string,
		private _weight: number | null
	)
	
	get name() { return this._name }
	get weight() { return this._weight }
}

````

interfaceでreadonlyプロパティにすればよかっただけの話。
無駄な記述が増えるし、
JSON.parseしたときにgetterが使えない問題があったりしたので話をややこしくしてしまった。

TypeScriptは基本的にinterfaceで定義、メソッドはfunctionで定義すればいいだけ
ついJavaの考えでいってしまった
