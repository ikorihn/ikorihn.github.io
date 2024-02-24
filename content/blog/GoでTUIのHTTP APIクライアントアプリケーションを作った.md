Web APIの開発時に、[Postman](https://www.postman.com)のようなクライアントツールを使うことが多いと思います。
こういったツールではリクエストの作成・保存、レスポンスの確認や、ドキュメンテーションやモックサーバーなどいろいろな機能があります。
私の用途ではリクエスト送信とレスポンスの確認ができればいいので、もっと軽量でアカウント等不要で、キーボードだけで操作できるようなツールを探していました。
ですがあまりしっくり来るものがなく、それなら自分で作りましょうということで、ターミナル上で使えるHTTP APIクライアントアプリケーションを作ったので紹介します。

## 作ったもの

https://github.com/ikorihn/kuroneko.git

Goの [rivo/tview](https://github.com/rivo/tview) を使用して作成しました。

## 機能

### 基本操作

`[]` で囲われた数字キーを押すとそのペインに切り替わります。
ペインを切り替えたらTABや矢印で移動します。

### GETリクエスト

![](https://storage.googleapis.com/zenn-user-upload/d5bfa67fcf0b-20240105.gif)

一番簡単な使い方は、URLを入力してSendを押すことです。
これでGETリクエストが送信できます。

### POSTリクエスト

![](https://storage.googleapis.com/zenn-user-upload/d24d596769a1-20240105.gif)

PUT, DELETEなども送信できます。
つまりbodyを指定したリクエストができます。

Body を押すと、`$EDITOR` (未指定の場合vim)が起動してbody編集が行なえます。

### レスポンス

![](https://storage.googleapis.com/zenn-user-upload/8526935d6868-20240105.gif)

レスポンスペインには、レスポンスボディと、ステータスコード、トレース情報が表示されています。
ペインを選択するとボディ、ヘッダー、curlコマンドの表示を切り替えるダイアログが表示されます。

### 履歴

履歴ペインには、kuronekoを起動してからのリクエスト履歴が表示されます。
プロセスを終了すると揮発します。

履歴上でsキーを押すとお気に入りに保存できます。

### お気に入り

お気に入りペインには、保存されたリクエストが表示されます。
こちらは履歴と違って終了しても消えません。

### curlコマンド

実験的な機能として、curlコマンドとの相互変換を行えるようになっています。
100%の精度は保証できないためあくまで大まかに変換が行えるといった機能ですが、私は好きな機能です。

`C` でcurlコマンドを入力するフォームが開いて、`curl <args>` を入力するとリクエストフォームに記入されます。
リクエスト送信後、レスポンスペインで今回のリクエストをcurlコマンドに変換したものが表示されます。

## tviewについて

tviewはGoでTUIを構築するためのライブラリです。
exampleが豊富なので、簡単なレイアウトはすぐに構築できると思います。

tview.Primitiveインターフェースを実装する形で、様々なウィジェットが用意されており、
入力フォームを作る [InputField](https://github.com/rivo/tview/wiki/InputField) や、 テキストを表示する [TextView](https://github.com/rivo/tview/wiki/TextView) などの基本パーツの他にも [自分で実装することもできます](https://github.com/rivo/tview/wiki/Primitives)

tviewの使い方について軽く紹介しておこうと思います。とはいってもtviewに関する記事はいっぱいあるので、ここでは自分が特にわかりにくかったGridの書き方を紹介します。

### Grid

https://github.com/rivo/tview/wiki/Grid を使うとグリッドレイアウトを組むことができます。
ウィンドウのサイズに合わせてレスポンシブに変更することもできます。

```go
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
		SetRows(3, 0, 3). // 高さが3の行、可変の行、3の行
		SetColumns(30, 0, 30). // 幅が30の列、可変の列、30の列
		SetBorders(true).
		AddItem(newPrimitive("Header"), 0, 0, 1, 3, 0, 0, false).
		AddItem(newPrimitive("Footer"), 2, 0, 1, 3, 0, 0, false)

	// ウィンドウが100セル未満の幅のときのレイアウト
	grid.AddItem(menu, 0, 0, 0, 0, 0, 0, false).
		AddItem(main, 1, 0, 1, 3, 0, 0, false).
		AddItem(sideBar, 0, 0, 0, 0, 0, 0, false)

	// ウィンドウが100セル以上の幅のときのレイアウト
	grid.AddItem(menu, 1, 0, 1, 1, 0, 100, false).
		AddItem(main, 1, 1, 1, 1, 0, 100, false).
		AddItem(sideBar, 1, 2, 1, 1, 0, 100, false)

	if err := tview.NewApplication().SetRoot(grid, true).SetFocus(grid).Run(); err != nil {
		panic(err)
	}
}
```

### SetRows, SetColumns

`SetRows(rows ...int)` や `SetColumns(columns ...int)` は、引数の個数でGridの行数(列数)を指定し、値は高さ(幅)を指定します。
値に0か-1を渡した場合は、動的に高さや幅が変わるようになり、マイナスの値を渡した場合は値に応じた割合となります。

たとえば全体の幅が100のセルで `SetColumns(30, 10, -1, -1, -2)` とすると、左から固定幅30と10のセルができ、残りは1:1:2の割合で分割されます。つまり 30, 10, 15, 15, 30となります。

### SetMinSize

`SetMinSize(row, column int)` はセルの最小の高さ、幅を指定します。
`SetColumns(30, 10, -1, -1, -2)` でさらに `grid.SetMinSize(25, 10)` を呼ぶと、
幅は 30, 25, 25, 25, 30 となり、全体で135セルで35セルははみ出ることになります。

### AddItem

`AddItem(p Primitive, row, column, rowSpan, colSpan, minGridHeight, minGridWidth int, focus bool)` はアイテムpを指定した位置と大きさで配置します。
`(0, 0)` を一番左上のセルとして、row, columnでセルの左上の位置を指定し、rowSpan, colSpanで大きさを指定します。
例えば行2~4、列5~6のセルを作るには `grid.AddItem(p, 2, 5, 3, 2, 0, 0, true)` とします。

## おわりに

[rivo/tview](https://github.com/rivo/tview) を使うと、簡単にTUIアプリケーションを構築することができました。
すでにAPI開発で使っていますが、なかなか便利なものができたと思います。
なにより普段Neovimで開発している身としてはターミナルから出ずに操作できるのが気に入っています。curlコマンドを手打ちする煩わしさから開放されました。
現時点ではファイルやFormのPOSTには未対応だったり、クエリパラメータの入力をしやすくしたいなど、足りていない部分や改善したい部分もありますがその辺は今後拡張していきたいと思います。
プルリクもお待ちしています！
