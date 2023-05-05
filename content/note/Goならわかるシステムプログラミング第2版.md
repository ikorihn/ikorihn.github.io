---
title: Goならわかるシステムプログラミング第2版
author: null
published date: null
started reading on: 2022-08-17 23:41
finished reading on: null
tags:
- reading
---

## 1章

* 

## 2章

* io.Writer
* ファイルディスクリプタに対応するモノは、通常のファイルには限られません。標準入出力、ソケット、OS や CPU に内蔵されている乱数生成の仕組みなど、本来ファイルではないものにもファイルディスクリプタが割り当てられ、どれもファイルと同じようにアクセスできます。
* これと同じように、ファイルディスクリプタのような共通化の仕組みを言語レベルで模倣して整備し、OS による API の差異を吸収しています。その一例が、本章で取り上げる io.Writer です。

## 3章 io.Reader

データ読み込みのインターフェース
読み込んだ内容を引数に格納し、バイト数をかえす

`io.Copy`
`io.Reader` から `io.Writer` にそのままデータを渡す

````go
// すべて書き出す
writeSize, err := io.Copy(writer, reader)
// 指定したサイズだけコピー
writeSize, err := io.CopyN(writer, reader, size)
````

ファイル入力、ネットワーク通信など

バイナリ解析がへーとなった
PNGファイルの読み込み

ストリーム
インターフェースをつかったデータ入出力
Goではストリームは言わないがパイプとして使える

* `io.MultiReader`
* `io.TeeReader`
  * Readerでreadした内容を別のio.Writerに書き出す
* `io.Pipe` (io.PipeReader と io.PipeWriter)

## 4章 チャネル

バッファ付きかいなかで動作かわる

````go
package main

import (
	"fmt"
	"strconv"
	"time"
)

func sub(message chan string) {

	for i := 0; i < 5; i++ {
		message <- "hello " + strconv.Itoa(i)
	}

	fmt.Println("wait close")
	close(message)

}

func main() {
	fmt.Println("start")
	done := make(chan bool, 2)
	go func() {
		fmt.Println("sub() is finished")
		time.Sleep(time.Second)
		done <- true
	}()

	<-done

	message := make(chan string, 5)

	go sub(message)

	for ch := range message {
		fmt.Println(ch)
		time.Sleep(time.Second)
	}

	fmt.Println("end")
}

````

for文

````go
package main

import (
	"fmt"
	"math"
)

func primeNumber() chan int {
	result := make(chan int)

	go func() {
		result <- 2
		for i := 3; i < 100000; i+=2 {
			l := int(math.Sqrt(float64(i)))
			found := false
			for j := 3; j < l+1; j += 2 {
				if i%j == 0 {
					found = true
					break
				}
			}

			if !found {
				result <- i
			}
		}
		close(result)
	}()

	return result
}

func main() {
	fmt.Println("start")
	pn := primeNumber()
	fmt.Println("...")
	for n := range pn {
		fmt.Println(n)
	}
	fmt.Println("end")
}
````

### select文

複数のチャネルを待ち受けてデータが先に送信できたチャンネルのみ処理する
timeoutなど
`default` を書くと何も読み込めなかったときに実行される。ブロックせずにすぐ終了してしまう。この構文はチャネルにデータが入るまでポーリングでループを回す

````go
for {
    select {
    case data := <- reader:
        // データを使う
    default:
        break 
    }
}
````

### context

キャンセルやタイムアウトなど

## 5章 システムコール

システムコール: 特権モードでOSの機能を呼ぶこと

CPUの動作モード
プロセスは自分のことだけに集中し、メモリ管理や時間管理はプロセスの外からOSがすべて行う
CPUの仕組みに動作モードがあり、OSが動作する **特権モード** と一般的なアプリケーションが動作する **ユーザーモード**

通常のアプリケーションでも、メモリ割り当てやファイル入出力、インターネット通信などの機能が必要になることは多々あります
システムコールを介して、特権モードでのみ許されている機能をユーザーモードのアプリから呼び出すことができる

POSIXとC言語の標準規格
OS間で共通のシステムコールを決めることで、アプリケーションの移植性を高めるために作られたIEEE規格

POSIXのコンセプトは、「OS間のポータビリティを維持する」です。
Go言語は、ポータビリティを自力でがんばることでクロスコンパイルが容易になり、他のOSで動くバイナリが簡単に作成できるようになっています。

## 6章 TCPソケットとHTTPの実装

RPCはサーバーが用意しているさまざまな機能を、ローカルコンピューター上にある関数のように簡単に呼び出そう、という仕組みです
JSON-RPCでは、プロトコルバージョン("jsonrpc"キーの値)、メソッド("method")、引数("params")、送受信の対応を取るためのIDの4項目を使ってリクエストを送信します

アプリケーション層からトランスポート層のプロトコルを利用するときのAPIとしてソケットがある
OSには、シグナル、メッセージキュー、パイプ、共有メモリなど、数多くのプロセス間通信機能が用意されています。ソケットも、そのようなプロセス間通信の一種です
ソケットにはTCP、UDP、Unixドメインソケットなど
HTTPでは80番ポートに対してソケットを使ったプロセス間通信を行う

### ソケット通信

ソケットとか全然わかっていなかったなー

ファイルディスクリプタを介してプロセスの通信をおこなう。
ソケットは通信用の特別なファイルのようなもの。普通のファイル同様にディスクリプタを介してデータをやりとりする
http.Serveってしてたけど裏側はこうなっているんだ

サーバー: ソケットを開いて待ち受ける(Goでは `Listen()`)
クライアント: 開いているソケットに接続し通信を行う(Goでは `Dial()`)

````go
// クライアント
conn, err := net.Dial("tcp", "localhost:8080")

// サーバー
ln, err := net.Listen("tcp", ":8080")
conn, err := ln.Accept()
````

サーバー側はこれだと一度切りで終了してしまうのでfor loop

````go
for {
    conn, err := ln.Accept()
    go func() {
        // conn を使った読み書き
    }
}
````

### 低レベルAPIでサーバーを実装

TCPソケットを使ったHTTPサーバー(gzip圧縮)

````go
package main

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"strings"
	"time"
)

// クライアントはgzipを受け入れ可能か?
func isGZipAcceptable(request *http.Request) bool {
	return strings.Contains(strings.Join(request.Header["Accept-Encoding"], ","), "gzip")
}

// 1セッションの処理をする
func processSession(conn net.Conn) {
	fmt.Printf("Accept %v\n", conn.RemoteAddr())
	defer conn.Close()
	for {
		conn.SetReadDeadline(time.Now().Add(5 * time.Second))
		// リクエストを読み込む
		request, err := http.ReadRequest(bufio.NewReader(conn))
		if err != nil {
			var ne net.Error
			if errors.As(err, &ne) && ne.Timeout() {
				fmt.Println("Timeout")
				break
			} else if errors.Is(err, io.EOF) {
				break
			}
			panic(err)
		}
		dump, err := httputil.DumpRequest(request, true)
		if err != nil {
			panic(err)
		}
		fmt.Println(string(dump))
		// レスポンスを書き込む

		response := http.Response{StatusCode: 200,
			ProtoMajor: 1,
			ProtoMinor: 1,
			Header:     make(http.Header),
		}
		if isGZipAcceptable(request) {
			content := "Hello World (gzipped)\n" // コンテンツをgzip化して転送
			var buffer bytes.Buffer
			writer := gzip.NewWriter(&buffer)
			io.WriteString(writer, content)
			writer.Close()
			response.Body = io.NopCloser(&buffer)
			response.ContentLength = int64(buffer.Len())
			response.Header.Set("Content-Encoding", "gzip")
		} else {
			content := "Hello World\n"
			response.Body = io.NopCloser(
				strings.NewReader(content))
			response.ContentLength = int64(len(content))
		}
		response.Write(conn)
	}
}
func main() {
	listener, err := net.Listen("tcp", "localhost:8888")

	if err != nil {
		panic(err)
	}
	fmt.Println("Server is running at localhost:8888")
	for {
		conn, err := listener.Accept()
		if err != nil {
			panic(err)
		}
		go processSession(conn)
	}

}
````

### Keep-Alive

HTTP/1.0 では、1セットの通信が終わるたびにTCPコネクションが切れる。
HTTP/1.1 ではKeep-Aliveが規格にはいって、しばらくの間TCPコネクションを維持する。
TCPはコネクションを確立するのに1.5RTT(Round Trip Time) がかかるぶん余計な時間がかかる。Keep-Aliveがこのぶんのオーバーヘッドをなくせる

他に速度改善の手法として、gzip圧縮、チャンク形式のボディ送信、パイプライニングがあげられている

## 7章 UDPソケットを使ったマルチキャスト

````go
// サーバー
package main

import (
	"fmt"
	"net"
	"time"
)

const interval = 10 * time.Second

func main() {
	fmt.Println("start tick server at 224.0.0.1:9999")
	conn, err := net.Dial("udp", "224.0.0.1:9999")
	if err != nil {
		panic(err)
	}

	defer conn.Close()

	start := time.Now()
	wait := start.Truncate(interval).Add(interval).Sub(start)
	time.Sleep(wait)
	ticker := time.Tick(interval)

	for now := range ticker {
		conn.Write([]byte(now.String()))
		fmt.Println("Tick: ", now.String())
	}

}
````

````go
// クライアント
package main

import (
	"fmt"
	"net"
)

func main() {
	fmt.Println("Listen tick server at 224.0.0.1:9999")
	address, err := net.ResolveUDPAddr("udp", "224.0.0.1:9999")
	if err != nil {
		panic(err)
	}

	listener, err := net.ListenMulticastUDP("udp", nil, address)
	if err != nil {
		panic(err)
	}

	defer listener.Close()

	buffer := make([]byte, 1500)

	for {
		length, remoteAddress, err := listener.ReadFromUDP(buffer)

		if err != nil {
			panic(err)
		}

		fmt.Printf("Server %v\n", remoteAddress)
		fmt.Printf("Now %s\n", string(buffer[:length]))
	}

}
````

UDPはクライアント側がソケットをオープンして待受、サーバー側がデータを送信する。
TCPとは逆のように見える。TCPのクライアントと同じような実装になっている

クラス D の『224.0.0.0〜239.255.255.255』のレンジはマルチキャストアドレス

NTPは遅延が致命的になるためTCPではなくUDP

### TCPとの違い

* TCPは1.5 RTTかかるがUDPは0 RTT
* TCPには再送処理とフロー処理がある
  * パケットの順序を受信側で並べ替えられる
  * 応答番号を返信して送信側は正しく受け取れたのかどうか判断し、受け取れてなかったら再送する
* ウィンドウ制御  受信側がリソースを確保できていないのに送信リクエストが集中してしまうのを防ぐ。
  * 受信用のバッファ(TCPではウィンドウという)を決めておき、送信側ではそのサイズまでは受信側からの受信確認を待たずにデータを送信できる
  * 受信できるウィンドウサイズを送信側につたえることで通信量を制御できる(フロー制御)
* フレームサイズ
  * ひとかたまりで送信できるデータサイズをMTU(最大転送単位)
  * MTUに収まらないデータはIPレベルで複数パケットに分割する
  * UDPを利用する場合にはデータ構造を1フレームで収まるサイズにし、フレームごとにフレームの内容を識別するヘッダーを付ける必要があるでしょう
* 輻輳制御
  * TCPには輻輳制御が備わっており、そのアルゴリズムにはさまざまな種類があります。どのアルゴリズムもゆっくり通信量を増やしていき、通信量の限界値を探りつつ、パケット消失などの渋滞発生を検知すると流量を絞ったり増やしたりしながら最適な通信量を探ります 

HTTP/2 と TCP で同じようなことを重複して行っている部分を統合し、UDP 上の QUIC を使うことでさらに無駄を減らそうというのが HTTP/3

## 8章 Unixドメインソケット

初めて聞いた。

Unixドメインソケットでは外部インタフェースへの接続は行いません。
その代わり、カーネル内部で完結する高速なネットワークインタフェースを作成します。
Unixドメインソケットを使うことで、ウェブサーバーとNGINXなどのリバースプロキシとの間、あるいはウェブサーバーとデータベースとの間の接続を高速にできる場合があります。

サーバーがファイルを作って、クライアントプロセスからファイルパスを使って通信相手を探す。
単にサーバーが作成したファイルにクライアントが書き込み、その内容を他のプロセスが見に行っているだけのようだが、
Unixドメインソケットはソケットファイルという特殊なファイルを作成する

## 9章 ファイルシステムの基礎

ファイル操作、path/filepath の関数の紹介

## 10章 ファイルシステムの最深部を扱う Go 言語の関数

ファイルの変更監視(syscall.Inotify)

* 監視したいファイルをOS側に通知しておいて、変更があったら教えてもらう(パッシブな 方式)
  * gopkg.in/fsnotify.v1†2 を利用したパッシブな方式
* タイマーなどで定期的にフォルダを走査し、os.Stat()などを使って変更を探しに行く (アクティブな方式)

ファイルのロック(syscall.Flock())

syscall.Flock()によるロックでは、すでにロックされているファイルに対してロックをかけようとすると、最初のロックが外れるまでずっと待たされます。そのため、定期的に何度もアクセスしてロックが取得できるかトライする、といったことができません。これを可能にするのがノンブロッキングモードです

ファイルのメモリへのマッピング(syscall.Mmap())
ファイルの中身をそのままメモリ上に展開できますし、メモリ上で書き換えた内容をそのままファイルに書き込むこともできます。マッピングという名前のとおり、ファイルとメモリの内容を同期させます

* 同期・ブロッキング: 読み込み・書き込み処理が完了するまでの間、何もせずに待ちます

* 同期・ノンブロッキング: APIを呼ぶと、即座に「まだ完了していないか」どうかのフラグと、現在準備ができているデータが得られ、クライアントが完了を知る必要があるときは、完了が返ってくるまで何度もAPIを呼びます(これをポーリング)

* 非同期・ブロッキング: I/O 多重化(I/O マルチプレクサー)とも呼ばれる。準備が完了したものがあれば通知してもらう、というイベント駆動モテル

* 非同期・ノンブロッキング: メインプロセスのスレッドとは完全に別のスレッドでタスクを行い、完了したらその通知だけを受け取る

* goroutine をたくさん実行し、それぞれに同期・ブロッキング I/O を担当させると、**非同期・ノンブロッキング** となる

* goroutine で並行化させた I/O の入出力でチャネルを使うことで、他の goroutine とやり取りする箇所のみの同期ができる

* このチャネルにバッファがあれば、書き込み側もノンブロッキングとなる

* これらのチャネルでselect構文を使うことで **非同期・ブロッキング** のI/O多重化ができる

* select 構文に default 節があると、読み込みをノンブロッキングで行えるようになり、非同期 IO 化ができる

### select属

非同期ブロッキング(I/O多重化)を効率よく実現するAPI
大量の入出力をさばく手法

OS の場合には、ブロックしうる複数の I/O システムコールをまとめて登録し、準備ができたものを教えてもらうのが select() の役割
Go 言語の select 文も、この点については OS が提供する select() システムコールと同じ

## 第11章 コマンドシェル101

### POSIX, SUS

POSIXという用語は、「UNIX」と名乗るために必要な **Single UNIX Specification(SUS)** と呼ばれる規格の別名でもあります

https://pubs.opengroup.org/onlinepubs/9699919799/
これを満たすものがPOSIX準拠を名乗れる

POSIXの規約に従って実装されたユーティリティプログラムは、使う側からすれば行儀のよいプログラムだと言えるでしょう。ユーティリティプログラムについてのPOSIXの規約には以下のようなものがあります

* 入力ファイルを引数として渡す(フラグではなく)
* 入力ファイルがなかった場合は標準入力を読み込む
* 入力ファイルが「-」でも標準入力を読み込む

UNIX を名乗れない Linux ですが、SUS をベースにしながら利便性を意識して GUI まわりのパッケージやファイルシステムの構成、プリンターサポートまわりなどを加えた ISO 規格として、 **LSB (Linux Standard Base)** というものがある

POSIX や LSB は巨大な規格であることから、それらの小さいサブセットとして、 **BusyBox** と呼ばれるソフトウェアもあります。
AlpineはBusyBoxをベースにしている

### Unix哲学

小さなユーティリティを組み合わせる

## 第12章 プロセスの役割とGo言語による操作

OSが実行ファイルを読み込んで実行するにはそのためのリソースを用意しなければならない。リソースをまとめたプログラムの実行単位がプロセス

* 実行ファイル名 : `os.Executable()`
* プロセスID : `os.Getpid()`
* 親プロセスID : `os.Getppid()`
* ユーザーID: `os.Getuid()` `os.Getgid()`

などGoからプロセス情報を取る関数が用意されている

OS から見たプロセスは、CPU 時間を消費してあらかじめ用意してあったプログラムに従って動く「タスク」
プロセスごとにプロセスディスクリプタを持っている

### Goプログラムからのプロセス起動

他のプロセスを扱うには以下を使う

* `os.Process`: 低レベル
* `os/exec` の `exec.Cmd`: 少し高機能

`exec.Command(名前, 引数, ...)` で起動できる
`exec.CommandContext` はContextを受け取れる
Contextがキャンセルされると、os.Process.Killで強制終了される

````go
func main() {
	cmd := exec.Command(os.Args[1], os.Args[2:]...)
	if err := cmd.Run(); err != nil {
		panic(err)
	}

	state := cmd.ProcessState
	fmt.Printf("%s\n", state.String())
	fmt.Printf(" Pid: %d\n", state.Pid())
	fmt.Printf(" System: %v\n", state.SystemTime())
	fmt.Printf(" User: %v\n", state.UserTime())
}
````

`cmd.Output()` で子プロセスの出力内容を得るが、実行時間が長いプログラムで最後にしか得られないのは不便
`StdinPipe` `StdoutPipe` でリアルタイムに通信できるパイプを取得できる

`github.com/mattn/go-colorable` `github.com/mattn/go-isatty` を使って出力に色をつけられる

````go
package main

import (
	"fmt"
	"io"
	"os"

	"github.com/mattn/go-colorable"
	"github.com/mattn/go-isatty"
)

var data = "\033[34m\033[47m\033[4mB\033[31me\n\033[24m\033[30mOS\033[49m\033[m\n"

func main() {
	var stdOut io.Writer
	if isatty.IsTerminal(os.Stdout.Fd()) {
		stdOut = colorable.NewColorableStdout()
	} else {
		stdOut = colorable.NewNonColorable(os.Stdout)
	}
	fmt.Fprintln(stdOut, data)
}
````

### フォーク

フォークは、ネイティブスレッドが扱いやすい言語や、Go言語のようにスレッドの活用がランタイムに組み込まれている言語以外では、マルチコアCPUの性能向上を生かすうえで強力な武器となります。
スクリプト言語では、インタプリタ内部のデータの競合が起きないようにグローバルインタプリタロック(GIL、Global Interpreter Lock)やジャイアント VMロック(GVL、Giant VM Lock)と呼ばれる機構があり、同時に動けるスレッド数が厳しく制限されて複数コアの性能が生かせないケースがあります。このときにfork() で複数のプロセスを作り、ワーカーとして並行に実行させることがよくあります。

たとえばPython には、これを効率よく行うための multiprocessing パッケージがあります。Node.jsにもclusterモジュールがあります。ウェブサーバーのApacheでも、事前にフォークしておくことで並行で処理を行うPreforkが一番最初に導入され、広く使われています。

親子のプロセスが作られるときは、どちらかのプロセスでメモリを変更するまではメモリの実体をコピーしない「コピーオンライト」でメモリが共有されます
そのため、子プロセス生成時に瞬時にメモリ消費量が大きく増えることはありません。
しかし、この仕様と言語のランタイムの相性が良くないことがあります。たとえば、Rubyにはガベージコレクタ用のフラグがObjectの内部構造体にあったことから、GCが走るタイミングでフラグの書き換えが発生して早期にメモリコピーが発生してしまうという問題がありました。
Instagram では、このコピーオンライトの問題を回避するためにGC を停止させて処理速度を向上させる方法を紹介していましたが、PythonのGCから共有オブジェクトを隠すオプションをPython本体に追加してコピーオンライトを防いだことで、メモリの増加量が50%減少しました。この修正はPython3.7に入りました。

### デーモン化

POSIX 系の OS で動き続けるサーバープロセスなどのバックグラウンドプロセスを作るための機能です
ログアウトしたりシェルをとじてもプロセスを終了させない仕組み

## 第13章 シグナルによるプロセス間の通信

シグナル

* プロセス間通信:カーネルが仲介して、あるプロセスから、別のプロセスに対してシグナルを送ることができる。自分自身に対してシグナルを送ることも可能

* ソフトウェア割り込み:システムで発生したイベントは、シグナルとしてプロセスに送られる。シグナルを受け取ったプロセスは、現在行っているタスクを中断して、あらかじめ登録しておいた登録ルーチンを実行する

* SIGKILL, SIGSTOP はアプリケーションではハンドルできない

* SIGTERM killコマンドがデフォルトで送信する

* SIGHUP 設定ファイルの再読み込みを外部から指示する用途で使われることがデファクトスタンダード

* SIGINT Ctrl+C ハンドルできるSIGKILL

## 第14章 Go言語と並列処理

この本の定義では

* 並行:CPU 数、コア数の限界を超えて複数の仕事を同時に行う
* 並列:複数の CPU、コアを効率よく扱って計算速度を上げる

goroutine 間の情報共有方法としてチャネルを使うことを推奨

スレッドとgoroutineの違い

* スレッドとはプログラムを実行するための「もの」であり、OS によって手配されるものて

* プログラムから見たスレッドは、「メモリにロードされたプログラムの現在の実行状態を持つ仮想 CPU」

* OS や CPU から見たスレッドは、「時間が凍結されたプログラムの実行状態」

* スレッドがCPUコアに対してマッピングされるのに対し、goroutineはOSのスレッド(Go 製のアプリケーションから見ると 1 つの仮想CPU)にマッピングされます

* 「機能が少ない代わりにシンプルで起動が早いスレッド」として提供されている

* M: Machine カーネルにとっての物理CPUコア

* P: Process カーネルにとってのスケジューラ

* G: goroutine カーネルにとってのプロセス

OSのスレッド(M)ごとにタスクであるG(goroutine)のリストがあり、ランキューなどのスレッドが行う作業を束ねるのはProcess(P)
Process Affinity の仕組みはない

runtimeパッケージで、OSのスレッドを直接操作することもできる

### Race Detector

データ競合を発見する機能
buildやrunじに `-race` をつけて実行すると、競合が発生した箇所と、競合した書き込みを行った goroutine、その goroutine の生成場所がわかる

### syncパッケージ

チャネルとselectでgoroutine間の同期は事足りる。
他の言語からの移植などでselectに書き直すのが大変なときに、syncパッケージを使う。

#### sync.Mutex

sync.Mutex は、実行パスに入ることが可能な goroutine を、排他制御によって制限する。
「メモリを読み込んで書き換える」コードに入る goroutine が 1 つに制限されるため、不整合を防ぐことができる
同時に実行されると問題が起きる実行コードの行を **クリティカルセクション** と呼びます
マップや配列に対する操作はアトミックでないので保護が必要

sync.Mutexの宣言は値でもポインタでもいいが、
値コピーしてしまうとロックしている状態のまま別の sync.Mutex インスタンスになってしまうため、他の関数に渡すときは必ずポインタで渡すようにします

````go
var id int
func generateId(mutex *sync.Mutex) int { 
    // 多くの場合は次のように連続して書く
    mutex.Lock()  
    defer mutex.Unlock()
    id++
    return id
}
````

#### チャネルとMutexの使い分け

* チャネルが有用な用途: データの所有権を渡す場合、作業を並列化して分散する場合、非同期で結果を受け取る場合
* Mutex が有用な用途: キャッシュ、状態管理

#### sync.WaitGroup

多数のgoroutineの待ち合わせに使う

````go
func main() {
  var wg sync.WaitGroup 
  wg.Add(2)
  go func() {
    fmt.Println("work 1")
    wg.Done()
  }()
  go func() {
    fmt.Println("work 2")
    wg.Done()
  }()

  wg.Wait()
  fmt.Println("end")
}
````

チャネルよりも sync.WaitGroup のほうがよいのは、**ジョブ数が大量にあったり、可変個だったりする場合**
100 以上の goroutine のためにチャネルを大量に作成して終了状態を伝達することもできますが、これだけ大量のジョブであれば、数値のカウントだけでスケールするsync.WaitGroup のほうがリーズナブルです。

#### sync.Once

一度だけ実行したい処理

````go
func initialize() {
    fmt.Println("1回だけ初期化")
}

var once sync.Once

func main() {
    once.Do(initialize)
    once.Do(initialize)
    once.Do(initialize)
}
````

init() を使っても初期処理は書けるが、タイミングを制御したいときなどはこちらを使う

#### sync.Cond

条件変数

* 先に終わらせなければいけないタスクがあり、それが完了したら待っているすべての goroutine に通知する(`Broadcast()` メソッド)
* リソースの準備ができしだい、そのリソースを待っている goroutine に通知をする (`Signal()` メソッド)

````go
func main() {
	var mutex sync.Mutex
	cond := sync.NewCond(&mutex)

	for _, name := range []string{"A", "B", "C"} {
		go func(name string) {
			// ロックしてからWaitメソッドを呼ぶ
			mutex.Lock()
			defer mutex.Unlock()
			// Broadcast()が呼ばれるまで待つ
			cond.Wait()
			// 呼ばれた!
			fmt.Println(name)
		}(name)
	}
	fmt.Println(" よーい ")
	time.Sleep(time.Second)
	fmt.Println("どん! ")
	// 待っているgoroutineを一斉に起こす
	cond.Broadcast()
	time.Sleep(time.Second)
}
````

チャネルの場合、待っているすべての goroutine に通知するとしたらクローズするしかないため、一度きりの通知にしか使えません。
sync.Cond であれば、何度でも使えます。また、通知を受け取る goroutine の数がゼロであっても複数であっても同じように扱えます

#### sync/atomic

不可分操作を提供する
途中でコンテキストスイッチが入って操作が失敗しないことが保証される

````go
var id int64 
func generateId(mutex *sync.Mutex) int64 {
    return atomic.AddInt64(&id, 1)
}
````

## 第15章 並行・並列処理の手法と設計のパターン

並行・並列処理の実現手法

* マルチプロセス
* イベント駆動
* マルチスレッド
* ストリーミング・プロセッシンク

## 第16章 Go 言語のメモリ管理

## 第17章 実行ファイルが起動するまで

ランタイムライブラリがカーネルへの命令などをラップしてる

Cの標準ライブラリをリンクしない
Goのランタイムにすべてgoroutineやメモリ管理などをふくんでいる
逆に、アプリケーションとランタイムを切り離すことも不可能
OSのカーネルのようなものはGoでは作れない Biscuitのような例はある

Goのランタイムに各OS用のエントリーポイントがあるためどのOSでもビルドできる

## 第18章 時間と時刻

低レイヤーにおけるタイマーやカウンターの仕組みと使い方

OSが使う時間の仕組みは沢山の種類のタイマーやカウンターがある

* OSが起動すると、リアルタイムクロック(RTC、ハードウェア) から現在時刻をよみとる
* OSのシステムクロック(ソフトウェア)に反映する
* ハードウェアのタイマーを設定し、一定間隔で割り込みがかかるようにする。この割り込みを受けて、システムクロックを更新したり、現在実行中のプロセスが持つ残りのタイムスライスを減らしたり、必要に応じてタスクの切り替えを行ったりします。

Linux カーネルのデフォルト設定だと、このタイマー割り込みの間隔は 1 秒 あたり 250 回となっています。この割り込みのたびに、jiffies というカウンター変数が増えます。このカウンター変数が1増加することを「1 Tick」という

モノトニック時刻は、OS 起動からの時間や、各プロセス起動からの時間をカウントなど巻き戻らない時刻
ウォールクロック時間は、日常生活における実時間
CPU時間はCPUが消費した時間

## 第19章 Go 言語とコンテナ
