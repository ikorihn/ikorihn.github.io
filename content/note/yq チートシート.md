---
title: yq チートシート
date: 2023-01-27T13:05:00+09:00
tags:
- 2023/01/27
- shell
- yaml
- yq
---

[yq](note/yq.md) にはGo版とPython版があるので、注意する。Go版をここでは使う

https://mikefarah.gitbook.io/yq/
https://github.com/mikefarah/yq

## 

## shellの変数を使う

このような書き方では変数が正しく利用されない

````shell
MY_NAME=Alice
yq ".users.$MY_NAME" group.yaml
````

`env` や `strenv` を使うことで環境変数が展開される

````shell
lts_version=$(curl -LSs https://updates.jenkins.io/stable/latestCore.txt)
echo "${lts_version}"
val="${lts_version}" ./yq e -i '.controller.tag=strenv(val)' $file
````

````shell
installed_plugins=$(./yq '.controller.installPlugins' $file)
for p in $(echo $PLUGIN_NAME_VERSION); do
  name=$(echo $p | cut -d':' -f1)
  installed_plugins=$(echo "$installed_plugins" | sed -r "s/$name:.*/$p/")
done
updated_plugins=$(echo "$installed_plugins" | sed -e "s/- /'/" -e "s/$/'/g" | tr '\n' ",")
echo "$updated_plugins"
val="[${updated_plugins}]" ./yq e -P -i '.controller.installPlugins=env(val)' $file
````
