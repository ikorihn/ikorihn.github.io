---
title: yum パッケージバージョンを指定してインストールする
date: 2023-04-04T18:53:00+09:00
tags:
- 2023/04/04
- Linux
lastmod: 2023-04-04T18:53:00+09:00
---


````shell
$ yum --showduplicates search java-17-
Loaded plugins: ovl, priorities
============================================================================== N/S matched: java-17- ===============================================================================
1:java-17-amazon-corretto-17.0.1+12-2.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.1+12-3.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.2+8-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.3+6-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.4+8-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.4+9-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.5+8-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-17.0.6+10-1.amzn2.1.aarch64 : Amazon Corretto development environment
1:java-17-amazon-corretto-devel-17.0.1+12-2.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.1+12-3.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.2+8-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.3+6-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.4+8-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.4+9-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.5+8-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-devel-17.0.6+10-1.amzn2.1.aarch64 : Amazon Corretto 17 development tools
1:java-17-amazon-corretto-headless-17.0.1+12-2.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.1+12-3.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.2+8-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.3+6-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.4+8-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.4+9-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.5+8-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-headless-17.0.6+10-1.amzn2.1.aarch64 : Amazon Corretto headless development environment
1:java-17-amazon-corretto-javadoc-17.0.1+12-2.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.1+12-3.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.2+8-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.3+6-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.4+8-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.4+9-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.5+8-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-javadoc-17.0.6+10-1.amzn2.1.aarch64 : Amazon Corretto 17 API documentation
1:java-17-amazon-corretto-jmods-17.0.1+12-2.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.1+12-3.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.2+8-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.3+6-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.4+8-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.4+9-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.5+8-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
1:java-17-amazon-corretto-jmods-17.0.6+10-1.amzn2.1.aarch64 : Amazon Corretto 17 jmods
````

使いたいパッケージバージョンをフルで指定する
archは書かなくてもいい

````shell
$ yum install java-17-amazon-corretto-17.0.6+10-1.amzn2.1
````
