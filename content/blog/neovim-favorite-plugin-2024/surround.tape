Output "surround.gif"

Set Shell "zsh"
Set FontSize 20
Set Width 800
Set Height 400
Set Padding 0

Hide
Type@0ms "nvim surround.ts" Enter
Show
Sleep 2s

Type `cs'"`
Sleep 2s
Type `ds"`
Sleep 2s
Type `jj`
Sleep 2s
Type "ysiw`"
Type "ysi`{"

Sleep 2s
Hide
Type ":q!" Enter

