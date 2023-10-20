---
title: 記事メモ ZOZOTOWNのGo言語におけるマイクロサービス開発の共通規約を守るための取り組み
date: 2022-10-04T23:31:00+09:00
tags:
- Go
- article
---

* [ZOZOTOWNのGo言語におけるマイクロサービス開発の共通規約を守るための取り組み - ZOZO TECH BLOG](https://techblog.zozo.com/entry/zozo-microservice-conventions-in-golang)
  * 開発テンプレートを用意しておいて、各マイクロサービスが最低限守って欲しい規約を守らせる
  * バックエンドの共通規約の実装例として次のようなものがあります。
    * トレース
    * ヘッダー処理
    * 認証
  * 必ず出力してほしい項目についてはロガーのライブラリを作っておいて共通化するのありだね
  * リクエストスコープ全体で使いたいものはcontextに入れておくのがよさげ

````go
func RequestMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ctx := r.Context()
        if userAgent := r.Header.Get(constant.HeaderKeyForwardedUserAgent); userAgent != "" {
            ctx = setForwardedUserAgent(ctx, userAgent)
        }
        if userIP := r.Header.Get(constant.HeaderKeyUserIP); userIP != "" {
            ctx = setUserIPAddress(ctx, userIP)
        }
        if traceID := r.Header.Get(constant.HeaderKeyZozoTraceID); traceID != "" {
            ctx = SetTraceID(ctx, traceID)
        }
        if uid := r.Header.Get(constant.HeaderKeyZozoUID); uid != "" {
            ctx = setUID(ctx, uid)
        }
        if xForwardedFor := r.Header.Get(constant.HeaderKeyXForwardedFor); xForwardedFor != "" {
            ctx = setXForwardedFor(ctx, xForwardedFor)
        }
        if r.RemoteAddr != "" {
            ctx = setRemoteAddress(ctx, r.RemoteAddr)
        }
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
````

````go
func setHeaders(ctx context.Context, request *http.Request) error {
    if encodedInternalIDToken, err := middleware.GetEncodedInternalIDToken(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyZozoInternalIDToken, encodedInternalIDToken)
    }
    if ipAddress, err := middleware.GetUserIPAddress(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyUserIP, ipAddress)
    }
    if userAgent, err := middleware.GetForwardedUserAgent(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyForwardedUserAgent, userAgent)
    }
    if traceID, err := middleware.GetTraceID(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyZozoTraceID, traceID)
    }
    if uid, err := middleware.GetUID(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyZozoUID, uid)
    }
    if apiClient, err := middleware.GetAPIClient(ctx); err == nil {
        request.Header.Set(constant.HeaderKeyAPIClient, apiClient)
    }
    if xForwardedFor, err := middleware.GetXForwardedFor(ctx); err == nil {
        if remoteAddr, err := middleware.GetRemoteAddress(ctx); err == nil {
            host, _, e := net.SplitHostPort(remoteAddr)
            if e != nil {
                return xerrors.Errorf("split remote address: %v", e)
            }
            request.Header.Set(constant.HeaderKeyXForwardedFor, xForwardedFor+", "+host)
        }
    }
    return nil
}
````

 > 
 > 当初はサービス毎にテンプレートのリポジトリをコピーする方式でしたが、プロジェクト開始時のバージョンのコードがコピーされ、テンプレートの変更をサービス側で取り込む運用を想定していました。 しかし利用プロジェクトが増えるとそれぞれに反映してもらう手間、実装タイミング、プロジェクト毎に反映の有無が別れるなど運用の手間（負荷）が懸念されました。

わかる

 > 
 > SDK化することで機能のつながりがわかりづらくなったり、インポートの手間が増えたりと障壁がゼロなわけではありません。 そこで、テンプレートの位置付けをSDKの利用方法を示したサンプルアプリケーションと改めることでSDKの理解が進むようにし、各サービスに展開しやすくしています。

ライブラリにしてインポートしてもらうのが良さげで、テンプレートはモデルケースみたいな感じにする
