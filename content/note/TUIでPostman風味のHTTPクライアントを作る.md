---
title: TUIでPostman風味のHTTPクライアントを作る
date: 2023-12-14T14:50:00+09:00
lastmod: 2023-12-17T22:48:13+09:00
tags:
  - Go
  - terminal
---


## なにをしたい？

- REST APIの開発中、テストリクエストを投げたいときに毎回コマンド履歴からcurlとかhttpieのリクエストを探して再実行しているけれど、リクエストの組み立てや履歴からの実行がツールになっていると嬉しいな
- [Postman](https://www.postman.com) とかあるけど、ターミナルを出たくない
    - UIはこれを参考にしよう

## 構想

- https://github.com/rivo/tview を使ってみたい
- できること
    - 履歴(最大N件をリストで)
        - リクエストとそのときのレスポンスが見れるとか
        - どこかに履歴を保存しておいて、起動時にロードするみたいな
    - フォルダでグループ分けできる
    - ワークスペース
        - リクエスト
            - bodyの入力
        - レスポンス
        - ヘッダー

## できたもの

{{< card-link "https://github.com/ikorihn/kuroneko" >}}

## 実装メモ

### tviewの使い方

[[tview]] 

### アプリケーションの初期化、実行

Applicationを作って、Viewを作ってapp.SetRootを呼び、Runを実行することでTUIが起動する

```go
func main() {
    app := tview.NewApplication()
    
    navigation := tview.NewGrid().SetRows(0).
        AddItem(list, 0, 0, 1, 1, 0, 0, true)
    main := tview.NewGrid().
        SetRows(20, 0).
        SetColumns(20, 0).
        AddItem(inputForm, 0, 0, 1, 15, 10, 0, false).
        AddItem(out, 1, 0, 1, 20, 0, 0, false)
    rootGrid = tview.NewGrid().
        SetRows(0).
        SetColumns(0, 0).
        SetBorders(false).
        AddItem(navigation, 0, 0, 1, 1, 0, 0, true).
        AddItem(main, 0, 1, 1, 1, 0, 0, false)
    
    rootView = tview.NewPages().AddPage("main", rootGrid, true, true)
    
    app.SetRoot(rootView, true).SetFocus(inputForm).Run()
}
```

### UIの設計方針

Viewの操作をすることが多いので、グローバル変数かstructのフィールドに詰め込むのがいいと思う

```go
type UI struct {
	app      *tview.Application
	rootView *tview.Pages
	rootGrid *tview.Grid

	history             *tview.List
	inputForm           *tview.Form
	inputMethod         *tview.DropDown
	inputUrl            *tview.InputField
	responseText        *tview.TextView
}

func NewUi() *UI {
	ui := &UI{}

	ui.app = tview.NewApplication()

	ui.history = tview.NewList().ShowSecondaryText(true).SetSecondaryTextColor(tcell.ColorDimGray)
	ui.history.SetTitle("History").SetBorder(true)

// ....
}
```


### キーマップを設定する

このviewにいるときにこのキーをおしたらこういう動きをする っていうのを設定する

```go
func (u *UI) setupKeyboard() {
	u.app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Rune() {
		case 'q':
            // InputField以外にいるときは q を押せば終了する
			if _, ok := u.app.GetFocus().(*tview.InputField); !ok {
				u.app.Stop()
			}
		}
		return event
	})

	u.headerList.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Key() {
		case tcell.KeyEnter:
			curIdx := u.headerList.GetCurrentItem()
            u.headerList.RemoveItem(curIdx)
		case tcell.KeyEsc, tcell.KeyTab:
			u.app.SetFocus(u.inputForm)
		}

		return event
	})

}
```


### curlコマンドを出力する

http.Requestをcurlコマンドとして出力できたら最高だと思ったので
https://github.com/moul/http2curl で変換、出力するようにした

### clipboard にコピーする

レスポンスをクリップボードにコピーしたかったので、 [atotto/clipboard](https://github.com/atotto/clipboard) を使った。
次のようにして `y` でクリップボードに書き込むようにした。

```go
	u.responseViewModel.responseField.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Rune() {
		case 'y':
			clipboard.WriteAll(u.responseViewModel.responseField.GetText(true))
			return nil
		}

		return event
	})

```

### お気に入りを保存する

保存先は [[XDG_BASE_DIRECTORY]] の XDG_DATA_HOME にする
https://github.com/adrg/xdg を使う

保存形式は[[toml]] でいいかな
