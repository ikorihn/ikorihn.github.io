---
title: WSL2 Ubuntu20.04の環境構築
date: 2021-08-09T19:15:00+09:00
tags:
- Windows
- Linux
---

## WSL2をデフォルトにする

powershell

````shell
$ wsl --set-default-version 2
$ wsl -l -v
  NAME            STATE           VERSION
* Legacy          Stopping        1
  Ubuntu-20.04    Stopping        2
````

Legacy を削除
<https://docs.microsoft.com/ja-jp/windows/wsl/install-legacy#uninstallingremoving-the-legacy-distro>

````shell
wsl --unregister Legacy
````

## Linuxbrewを入れる

<https://brew.sh/> のワンライナーでインストールして、
<https://docs.brew.sh/Homebrew-on-Linux> のコマンドを入力してPATHを通す

## python

````shell
sudo apt update
sudo apt -y upgrade

sudo apt install python-is-python3 python3-pip
python -V
# => 3.8
python3 -V
# => 3.8
````

## zsh

````shell
brew install zsh
which zsh | sudo tee -a /etc/shells
chsh -s $(which zsh)
````

Linuxbrewを使えるようにしておく

````shell
echo "eval \$($(brew --prefix)/bin/brew shellenv)" >> ~/.zshrc
````
