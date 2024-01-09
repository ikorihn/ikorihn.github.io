---
---

---

title: tview
date: 2023-12-25T14:55:00+09:00
tags:

* Go
* terminal

---

{{< card-link "https://github.com/rivo/tview" >}}

[Go](note/Go.md) でTUIを構築するためのライブラリ。
exampleが豊富なので、基本的なレイアウトが簡単に作成できる。

Primitiveインターフェースを実装する形で、様々なウィジェットが用意されており、
入力フォームを作る [InputField](https://github.com/rivo/tview/wiki/InputField) や、 テキストを表示する [TextView](https://github.com/rivo/tview/wiki/TextView) などの基本パーツの他にも[自分で実装することもできる](https://github.com/rivo/tview/wiki/Primitives)

## Grid

https://github.com/rivo/tview/wiki/Grid を使うとグリッドレイアウトを組むことができる。
ウィンドウのサイズに合わせて *レスポンシブ* に変更することもできる。

````go
package main

import (
	"github.com/rivo/tview"
)

func main() {
	newPrimitive := func(text string) tview.Primitive {
		return tview.NewTextView().
			SetTextAlign(tview.AlignCenter).
			SetText(text)
	}
	menu := newPrimitive("Menu")
	main := newPrimitive("Main content")
	sideBar := newPrimitive("Side Bar")

	grid := tview.NewGrid().
		SetRows(3, 0, 3).
		SetColumns(30, 0, 30).
		SetBorders(true).
		AddItem(newPrimitive("Header"), 0, 0, 1, 3, 0, 0, false).
		AddItem(newPrimitive("Footer"), 2, 0, 1, 3, 0, 0, false)

	// Layout for screens narrower than 100 cells (menu and side bar are hidden).
	grid.AddItem(menu, 0, 0, 0, 0, 0, 0, false).
		AddItem(main, 1, 0, 1, 3, 0, 0, false).
		AddItem(sideBar, 0, 0, 0, 0, 0, 0, false)

	// Layout for screens wider than 100 cells.
	grid.AddItem(menu, 1, 0, 1, 1, 0, 100, false).
		AddItem(main, 1, 1, 1, 1, 0, 100, false).
		AddItem(sideBar, 1, 2, 1, 1, 0, 100, false)

	if err := tview.NewApplication().SetRoot(grid, true).SetFocus(grid).Run(); err != nil {
		panic(err)
	}
}
````

### SetRows, SetColumns

`SetRows(rows ...int)` や `SetColumns(columns ...int)` は、引数の個数でGridの列数や行数を指定し、値は高さや幅を指定する。
値に0か-1を渡した場合は、動的に高さや幅が変わるようになる。マイナスの値を渡した場合、値に応じた割合になる。

全体の幅が100のセルで `SetColumns(30, 10, -1, -1, -2)` とすると、固定幅30と10のセルと、残りは割合で1:1:2の幅に分割される。
つまり 30, 10, 15, 15, 30 という幅になる。

### SetMinSize

`SetMinSize(row, column int)` はセルの最小の高さ、幅を指定する。
上記にさらに `grid.SetMinSize(25, 10)` を呼ぶと、
幅は 30, 25, 25, 25, 30 となり、全体で135セルで35セルははみ出る

### AddItem

`AddItem(p Primitive, row, column, rowSpan, colSpan, minGridHeight, minGridWidth int, focus bool)` はアイテムを配置する箇所と大きさを指定する。
0,0 は一番左上のセルを示す。
例えば 行2, 3, 4と列5, 6のセルを作るには `grid.AddItem(p, 2, 5, 3, 2, 0, 0, true)` のようにする。
