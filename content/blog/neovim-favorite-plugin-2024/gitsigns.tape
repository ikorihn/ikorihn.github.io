Output "gitsigns.gif"

Set Shell "zsh"
Set FontSize 20
Set Width 800
Set Height 400
Set Padding 0

Hide
Type@0ms "nvim hello.txt" Enter
Show
Sleep 2s

Type ":Gitsigns diffthis" Enter
Sleep 1s
Ctrl+w Ctrl+w
Type ":q" Enter
Sleep 1s
Type ":Gitsigns next_hunk" Enter
Sleep 1s
Type ":Gitsigns next_hunk" Enter
Sleep 1s
Type ":Gitsigns next_hunk" Enter
Sleep 1s
Type ":Gitsigns stage_hunk" Enter
Sleep 1s
Type ":Gitsigns diffthis" Enter

Sleep 2s
Hide
Type ":q!" Enter

