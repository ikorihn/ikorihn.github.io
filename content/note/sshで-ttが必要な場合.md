---
title: sshで-ttが必要な場合
date: 2023-05-05T20:33:00+09:00
tags:
- ssh
- terminal
---

[ssh](note/ssh.md) でコマンドが実行できないときがあり調べた

[sshを使ってリモートマシンでコマンドを叩く際の注意点 - 覚書](https://satoru-takeuchi.hatenablog.com/entry/2017/04/11/223932)

man(1) [ssh](http://d.hatena.ne.jp/keyword/ssh)より抜粋:

 > 
 > -t Force pseudo-terminal allocation. This can be used to execute arbitrary screen-based programs on a remote machine, which can be very useful, e.g. when implementing menu services.

まずはインターネット上からcrontabに書いたコマンドを実行すると、正しく[IPアドレス](http://d.hatena.ne.jp/keyword/IP%A5%A2%A5%C9%A5%EC%A5%B9)が得られました。これで解決したと思ってcrontab上の[ssh](http://d.hatena.ne.jp/keyword/ssh)に-tオプションを付与したものの、またしても[IPアドレス](http://d.hatena.ne.jp/keyword/IP%A5%A2%A5%C9%A5%EC%A5%B9)を書き込んでいるはずのファイルは空でした。

man(1) [ssh](http://d.hatena.ne.jp/keyword/ssh)を再度読んでみると、さきほど抜粋した-tオプションの説明には続きがありました。

 > 
 > -t Force pseudo-terminal allocation. This can be used to execute arbitrary screen-based programs on a remote machine, which can be very useful, e.g. when implementing menu services. Multiple -t options force tty allocation, even if [ssh](http://d.hatena.ne.jp/keyword/ssh) has no local tty.

cronなどのttyを持たないプロセス([daemon](http://d.hatena.ne.jp/keyword/daemon))から[ssh](http://d.hatena.ne.jp/keyword/ssh)を実行する場合は、-tオプションだけでは不十分で、-ttオプションが必要と書いてあります。crontab上の[ssh](http://d.hatena.ne.jp/keyword/ssh)に-ttオプションを付与したところ、無事問題は解決できました。最初からmanをちゃんと読んでおけばもう少し解決が楽でした。反省。
