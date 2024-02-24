---
title: Go echoサーバーのテスト
date: "2022-11-22T16:42:00+09:00"
tags:
  - 'Go'
lastmod: "2022-11-22T16:42:00+09:00"
---

#Go

echoのHandlerのテストは基本公式ドキュメントの通りにやればできる
https://echo.labstack.com/guide/testing/

## ファイルのアップロードとテキストのパラメータを同時に送る

<https://stackoverflow.com/questions/7223616/http-post-file-multipart>

```go
import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestUpload(t *testing.T) {
	// Setup
	e := echo.New()

	buf := new(bytes.Buffer)
	writer := multipart.NewWriter(buf)

	mh := make(textproto.MIMEHeader)
	mh.Set("Content-Type", "text/plain")

	fw, err := writer.CreateFormField("fileName")
	if err != nil {
		t.Error(err)
	}
	fw.Write([]byte("my-name"))
	tw, err := writer.CreateFormField("timestamp")
	if err != nil {
		t.Error(err)
	}
	tw.Write([]byte("20220102150607"))

	// create the form data
	part, err := writer.CreateFormFile("file", "someimg.png")
	if err != nil {
		t.Error(err)
	}
	// https://yourbasic.org/golang/create-image/
	img := createImage()
	err = png.Encode(part, img)
	if err != nil {
		t.Error(err)
	}

	// 忘れると終了メッセージが書かれない
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/", buf)
	req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/upload")

	h := &handler{}

	err = h.Upload(c)
	if err != nil {
		t.Errorf("Should not be error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Errorf("Not ok: %v", rec.Code)
	}
	if rec.Body.String() != `{"result":"success"}` {
		t.Errorf("Not match: %v", rec.Body.String())
	}

}

func createImage() *image.RGBA {
	width := 200
	height := 100

	upLeft := image.Point{0, 0}
	lowRight := image.Point{width, height}

	img := image.NewRGBA(image.Rectangle{upLeft, lowRight})

	// Colors are defined by Red, Green, Blue, Alpha uint8 values.
	cyan := color.RGBA{100, 200, 200, 0xff}

	// Set color for each pixel.
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			switch {
			case x < width/2 && y < height/2: // upper left quadrant
				img.Set(x, y, cyan)
			case x >= width/2 && y >= height/2: // lower right quadrant
				img.Set(x, y, color.White)
			default:
				// Use zero value.
			}
		}
	}

	return img
}


```
