---
title: shellでwhile readの中で変数を変更しても反映されない
date: 2023-01-04T17:34:00+09:00
tags:
- 2023/01/04
- shell
---

`while read` でループ実行したいときに、パイプで値を渡すことができる。
このときに、while文の中で変数をアップデートしても、変更が反映されない

````shell
$ sum=0
$ echo -e "1\n2\n3" | while read -r num; do echo "number: $num"; sum=$((sum+num)); done < <(echo -e "1\n2\n3")
number: 1
number: 2
number: 3
$ echo $sum
0
````

これは、パイプはサブプロセスで実行されるため親プロセスの変数に影響を与えられないため。
https://unix.stackexchange.com/questions/143958/in-bash-read-after-a-pipe-is-not-setting-values

````bash
cmd1 | cmd2
````

 > 
 > `bash` run `cmd2` in a subshell, so changing variable won't be visible to parent shell.

なのでpipeではなく `<` で値を渡す
[shellのプロセス置換Process Substitution](note/shellのプロセス置換Process%20Substitution.md)

````
while read line; do
done < <(echo -e "foo\nbar\nbaz")
````

これを使うと次のように書いて反映されるようにできる

````shell
$ sum=0
$ while read -r num; do echo "number: $num"; sum=$((sum+num)); done < <(echo -e "1\n2\n3")
number: 1
number: 2
number: 3
$ echo $sum
6
````
