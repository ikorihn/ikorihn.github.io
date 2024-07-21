Output "textcase.gif"

Set Shell "zsh"
Set FontSize 20
Set Width 1200
Set Height 600
Set Padding 0
Set TypingSpeed 0.1

Hide
Type@0ms "nvim textcase.go" Enter
Show
Sleep 2s

Type `22GfF`
Sleep 2s
Type `:Telescope textcase` Enter
Sleep 1s
Type `aLSP camel` Enter
Sleep 2s
Type `bb`
Sleep 1s
Type `:Telescope textcase` Enter
Sleep 1s
Type `aLSP snake` Enter
Sleep 2s
Type `:Telescope textcase` Enter
Sleep 1s
Type `aLSP upper` Enter

Sleep 2s
Hide
Type ":q!" Enter

