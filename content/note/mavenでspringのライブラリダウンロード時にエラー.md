---
title: mavenでspringのライブラリダウンロード時にエラー
date: "2023-05-05T19:07:00+09:00"
tags:
  - spring
  - Java
---
 

 spring-libs-release からダウンロードしようとするも、エラーになる
 https://repo.spring.io/libs-release からダウンロードしなきゃならないところ、
 http://repo.springsource.org/libs-release/
 から取得しようとしてタイムアウトエラーになっている
 524 Origin timeout
 
 やったこと
 ~/.m2/repository/org/springframework を削除したところ mvn package がすぐ終わった
 最初、1ライブラリだけを消したがそれだと意味ない
 
 repositories に
 ```
                 <repository>
                         <id>spring</id>
                         <name>spring</name>
                         <url>https://repo.spring.io/libs-release/</url>
                 </repository>
 ```
 を書いてみたりしたが、最初のmetadataのダウンロードがうまくいくがその後失敗するので意味なかった
 一度消して再ダウンロードしたときにはcentralからダウンロードされるようになった
 
 httpsでアクセスさせたいのにそれを設定する方法がないみたい
 
 
 原因
 mvn が spring-libs-release というidのrepositoryからダウンロードしようとする。
 これがどこで設定されているかわからない、設定したものではないのでおそらくspringからダウンロードしたライブラリのpomにかかれている。
 古いライブラリに書かれているんじゃないか。確かめる前に削除してしまったのでわからないが
 
 settings.xmlにtimeoutを書いておくのもありだと思う
 いくら調べても困っている人がいなくて逆に困った。こんなのメジャーな問題っぽいけどな
 
 こういうのも見つけた。repoのURLが一部使えなくなるよ これに引っかかったのでは
 https://spring.io/blog/2020/10/29/notice-of-permissions-changes-to-repo-spring-io-fall-and-winter-2020
 
 結論
 一度 ~/.m2/repostitory を消すのが最強
