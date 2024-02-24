---
title: zsh 呼び出し元のfunction名を取得する
date: "2022-11-30T19:34:00+09:00"
tags:
  - 'zsh'
---

https://stackoverflow.com/questions/31426565/get-name-of-calling-function-in-zsh

```shell
function a(){
    c
}

function b(){
    c
}

function c(){
     #if a call me; then...
     #if b call me; then...
}
```

bash 

- `${FUNCNAME[1]}` is a (caller name)
- `${FUNCNAME[0]}` is c (current name)

[[zsh]]

$funcstack
- `${funcstack[2]}` is a (caller name)
- `${funcstack[1]}` is c (current name)
