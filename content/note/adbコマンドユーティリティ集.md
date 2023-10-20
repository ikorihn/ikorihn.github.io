---
title: adbコマンドユーティリティ集
date: 2021-06-24T10:39:00+09:00
tags: null
---


````shell
# キャプチャを撮ってPCにコピーし、サイズを変更
adb_screencap() {
  local DATE_TIME=$(date +"%Y%m%d-%H%M%S")
  local FILE_NAME=${DATE_TIME}.png

  local DEST_DIR=${1:-~/Desktop}
  local SIZE=${2:-300x}

  adb shell screencap -p /sdcard/$FILE_NAME
  adb_pull_file $file_name $dest_dir

  mogrify -resize $SIZE -unsharp 2x1.4+0.5+0 -quality 100 -verbose $DEST_DIR/$FILE_NAME
}

# PCにファイルをコピーして元ファイルは削除
adb_pull_file() {
  file_name=$1
  directory=$2
  if [[ -z $file_name -o -z $directory ]]; then
    echo 'no file'
    return 1
  fi

  adb pull /sdcard/$file_name $directory/$file_name
  adb shell rm /sdcard/$file_name
}

# adbとはちょっと異なるが、mp4をgifに変換する
mp4_to_gif() {
  local FILE_NAME=$1
  local DEST_FILE_NAME=$(echo $FILE_NAME | tr -d '.mp4')
  ffmpeg -i $FILE_NAME -an -r 15 -pix_fmt rgb24 -s 540x960 -f gif $DEST_FILE_NAME
}

# https://github.com/fish-shell/fish-shell/issues/2036
adb_screenrecord() {
  local DATE_TIME=$(date +"%Y-%m-%dT%H-%M-%S")
  local FILE_NAME=$DATE_TIME.mp4
  local DEST_DIR=${1:-~/Desktop}

  trap "echo 'pull to $DEST_DIR/$FILE_NAME'; adb pull /sdcard/$FILE_NAME $DEST_DIR/$FILE_NAME; adb shell rm /sdcard/$FILE_NAME" SIGINT

  echo "録画を開始しました。録画を終了する場合は、 Ctrl+C を押下してください"
  adb shell screenrecord /sdcard/$FILE_NAME --size 540x960
}
````

[adbコマンドユーティリティ集](note/adbコマンドユーティリティ集.md)
[adbでAndroidの静止画・動画を取るコマンド](note/adbでAndroidの静止画・動画を取るコマンド.md)
