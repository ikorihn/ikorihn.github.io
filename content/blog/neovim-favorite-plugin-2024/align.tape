Output "align.gif"

Set Shell "zsh"
Set FontSize 20
Set Width 1200
Set Height 600
Set Padding 0

Hide
Type@0ms "nvim username.csv" Enter
Show

Sleep 1s
Type ":%s/,/|/g" Enter
Sleep 1s
Type "gaip|"
Sleep 1s
Type "f|"
Sleep 1s
Ctrl+v
Type "Gt|x"
Sleep 1s
Type "$p"

Sleep 2s
Hide
Type ":q!" Enter
