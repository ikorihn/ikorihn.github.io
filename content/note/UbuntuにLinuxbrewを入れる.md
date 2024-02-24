---
title: UbuntuにLinuxbrewを入れる
date: "2021-05-09T16:27:00+09:00"
tags:
  - 'Ubuntu'
  - 'Linux'
lastmod: '2021-05-09T16:41:24+09:00'

---

## Curl, Gitのバージョンが古い

```sh
~$ brew install curl
Error: Please update your system curl.
Minimum required version: 7.41.0
Your curl version: 7.35.0
Your curl executable: /usr/bin/curl
Error: Please update your system Git.
Minimum required version: 2.7.0
Your Git version: 1.9.1.
Your Git executable: /usr/bin/git
^C
Error: 'curl' must be installed and in your PATH!

```

apt update && apt upgrade ではバージョン変わらなかった

<https://blog.usejournal.com/how-to-manually-update-curl-on-ubuntu-server-899476062ad6>
<https://github.com/curl/curl>
<https://curl.se/docs/install.html>

```sh
$ cd /usr/local/src/
/usr/local/src$ git clone https://github.com/curl/curl.git
fatal: could not create work tree dir 'curl': 許可がありません
/usr/local/src$ sudo su -
root@DESKTOP-3HKIQ1T:~# git clone https://github.com/curl/curl.git
Cloning into 'curl'...
remote: Enumerating objects: 165592, done.
remote: Counting objects: 100% (404/404), done.
remote: Compressing objects: 100% (219/219), done.
remote: Total 165592 (delta 221), reused 320 (delta 184), pack-reused 165188
Receiving objects: 100% (165592/165592), 74.82 MiB | 5.67 MiB/s, done.
Resolving deltas: 100% (130310/130310), done.
Updating files: 100% (3409/3409), done.

root@DESKTOP-3HKIQ1T:~/curl# autoreconf -fi
libtoolize: putting auxiliary files in `.'.
libtoolize: copying file `./ltmain.sh'
libtoolize: putting macros in AC_CONFIG_MACRO_DIR, `m4'.
libtoolize: copying file `m4/libtool.m4'
libtoolize: copying file `m4/ltoptions.m4'
libtoolize: copying file `m4/ltsugar.m4'
libtoolize: copying file `m4/ltversion.m4'
libtoolize: copying file `m4/lt~obsolete.m4'
libtoolize: Remember to add `LT_INIT' to configure.ac.
configure.ac:120: installing './compile'
configure.ac:291: installing './config.guess'
configure.ac:291: installing './config.sub'
configure.ac:120: installing './install-sh'
configure.ac:125: installing './missing'
docs/examples/Makefile.am: installing './depcomp'
parallel-tests: installing './test-driver'
root@DESKTOP-3HKIQ1T:~/curl# vim GIT-INFO
root@DESKTOP-3HKIQ1T:~/curl# ./configure --with-openssl
checking whether to enable maintainer-specific portions of Makefiles... no
checking whether make supports nested variables... yes
checking whether to enable debug build options... no
checking whether to enable compiler optimizer... (assumed) yes
checking whether to enable strict compiler warnings... no
checking whether to enable compiler warnings as errors... no

...

make
make install

# これも必要だった
sudo ldconfig
```

<https://itsfoss.com/install-git-ubuntu/>

```sh
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
sudo apt install git
```
