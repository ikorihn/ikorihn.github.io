---
title: Rustでbitbucketのpermission操作するcliを作ってみる
date: "2023-05-05T20:20:00+09:00"
tags:
  - Rust
  - CLI
---
 

[[RustでCLIを作る]] の続き

Rust勉強がてらCLIで操作できるようにしてみる

- https://github.com/clap-rs/clap を使う
- [List explicit group permissions for a repository](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-permissions-config-groups-get) のようにリポジトリのuser, groupsへのpermissionを操作するAPIが用意されている。ただし、usernameでは操作ができず、UUIDを指定する。UUIDはadminじゃないと簡単にはとれなさそう。

## APIの使い方

ユーザー・グループの取得

```shell
$ curl -u $BITBUCKET_USER:$BITBUCKET_PASS "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/users"

{
  "values": [
    {
      "type": "repository_user_permission",
      "permission": "admin",
      "user": {
        "display_name": "John Doe",
        "type": "user",
        "uuid": "{77777777-88888-3333-aaaa-bbbbbbbbbbbb}",
        "account_id": "111111122222222ccccccccc",
        "nickname": "john-doe"
      }
    }
  ],
  "pagelen": 10,
  "size": 1,
  "page": 1
}

$ curl -u $BITBUCKET_USER:$BITBUCKET_PASS "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/groups"
{
  "values": [
    {
      "type": "repository_group_permission",
      "permission": "admin",
      "group": {
        "type": "group",
        "owner": {},
        "workspace": {},
        "slug": "administrator",
        "full_slug": "${workspace}:administrator",
        "name": "administrator",
        "default_permission": "admin",
        "email_forwarding_disabled": false,
        "account_privilege": "admin"
      }
    },
    {
      "type": "repository_group_permission",
      "permission": "read",
      "group": {
        "type": "group",
        "owner": {},
        "workspace": { },
        "slug": "developer",
        "full_slug": "${workspace}:developer",
        "name": "developer",
        "default_permission": "read",
        "email_forwarding_disabled": true,
        "account_privilege": "collaborator"
      }
    }
  ],
  "pagelen": 1,
  "size": 2,
  "page": 1
}

```

追加・更新
ユーザーのUUIDやグループのslugは、permission設定ずみのリポジトリから取得するのが楽かな？そのため一つのリポジトリはGUIから設定して、2つ目以降はCLIでできる感じ

```shell
# 更新だけじゃなく追加もできる
$ curl -u $BITBUCKET_USER:$BITBUCKET_PASS -X PUT -H "Content-Type: application/json" "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/users/%7Baaaaaaaa-7777-4567-8888-dddddddddddd%7D" -d '{ "permission": "write" }'
$ curl -u $BITBUCKET_USER:$BITBUCKET_PASS -X PUT -H "Content-Type: application/json" "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/groups/2022-ca9b0ca" -d '{ "permission": "write" }'
```

削除

```shell
$ curl -u $BITBUCKET_USER:$BITBUCKET_PASS -X DELETE -H "Content-Type: application/json" "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/users/%7Baaaaaaaa-7777-4567-8888-dddddddddddd%7D"
$lang curl -u $BITBUCKET_USER:$BITBUCKET_PASS -X PUT -H "Content-Type: application/json" "https://api.bitbucket.org/2.0/repositories/${workspace}/${slug}/permissions-config/groups/2021-ca9b0ca"
```

## 設計

```
user, user-a, {aaaaaaaa-7898-45d3-869f-dd6ddf7efc10}, write
user, user-b, {aaaaaaaa-7898-45d3-869f-dd6ddf7efc11}, read
group, group-1, 2022_abcdef12, write
```
みたいなCSVを食わせてこれのとおりに上書きする
PJごとに、持っているリポジトリにはすべて同じ設定ができれば満足だと思うので

列挙されていないものは削除までするか？一旦考えなくていいか

CSVを作るためには一回は手動で設定をしてAPIで取得する必要がある
CSVとかじゃなくても、このリポジトリと同じ設定を適用するというのでもいいんじゃないか

まずは取得するAPIを作って、JSONを操作する方法を調べて特定のキーを抽出する

### copy

`bb copy <src> <repo>`
srcと同じ権限にする

### list

一覧

`bb list <repo>`

### remove

`bb remove -u/-g <uuid> <repo>`

idをオプションで指定してもいいけど、listしたあと選択式で削除できると便利

### update

`bb update -u/-g <uuid> <repo>`

### login

毎回authオプションつけるのなんだしパスワードがでるのあれなので、
https://github.com/craftamap/bb を参考に、loginコマンドで `~/.bb.toml` を作ってusername, passwordを保存する的な
Macでの動作しか確認できんけどkeychainに入れるとか

```toml
[package]
name = "bitbucket-cli"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
ansi_term = "0.12.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["blocking", "json"] }
tokio = { version = "1", features = ["full"] }
clap = { version = "3.2.22", features = ["derive"] }
chrono = "0.4.20"
```

```rust
use ansi_term::Colour;
use chrono::{DateTime, Local};
use clap::{ArgEnum, Parser, Subcommand};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::thread::sleep;
use std::time::{Duration, Instant};
use std::{default, fs, process};

#[derive(Parser, Debug)]
#[clap(name = "bbrs", version, about, long_about = None, arg_required_else_help = true)]
struct Args {
    /// Username
    #[clap(short, long, value_name = "USERNAME")]
    username: String,

    /// App password
    #[clap(short, long, value_name = "APP PASSWORD")]
    password: String,

    /// Workspace
    #[clap(short, long, value_name = "WORKSPACE")]
    workspace: String,

    /// Repo slug
    #[clap(short, long)]
    slug: String,

    /// Output type
    #[clap(
        short,
        long,
        arg_enum,
        value_name = "OUTPUT TYPE",
        default_value = "text"
    )]
    output: Output,

    #[clap(subcommand)]
    command: Commands,
}

#[derive(Debug, Clone, ArgEnum, Copy)]
enum Output {
    Csv,
    Json,
    Text,
}

/// サブコマンドの定義
#[derive(Debug, Subcommand)]
enum Commands {
    List,
}

struct OutputMessage {
    datetime: DateTime<Local>,
    url: String,
    status_code: StatusCode,
    elapsed: Duration,
}

impl OutputMessage {
    fn new(
        datetime: DateTime<Local>,
        url: String,
        status_code: StatusCode,
        elapsed: Duration,
    ) -> Self {
        Self {
            datetime,
            url,
            status_code,
            elapsed,
        }
    }

    fn to_formatted(&self, output: Output) -> String {
        let dt = self.datetime.format("%Y-%m-%d %H:%M:%S").to_string();
        let url = self.url.as_str().to_string();
        let st = self.status_code.to_string();
        let response_time = format!(
            "{}.{:03}",
            self.elapsed.as_secs(),
            self.elapsed.subsec_nanos() / 1_000_000
        );

        match output {
            Output::Csv => {
                format!(r#""{}","{}","{}","{}""#, dt, url, st, response_time)
            }
            Output::Json => {
                format!(
                    r#"{{"datetime": "{}","url: "{}","statusCode": "{}","responseTime": "{}"}}"#,
                    dt, url, st, response_time
                )
            }
            Output::Text => {
                format!("{} {} {} {}", dt, url, st, response_time)
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let username: String = args.username;
    let password: String = args.password;
    let workspace: String = args.workspace;
    let slug: String = args.slug;
    let output: Output = args.output;

    let bitbucket = Bitbucket {
        username,
        password,
        workspace,
        slug,
    };

    match args.command {
        Commands::List => {
            list(bitbucket).await;
        }
    }
}

// Bitbucket APIを実行する

const BASE_URL: &str = "https://api.bitbucket.org/2.0";

struct Bitbucket {
    username: String,
    password: String,
    workspace: String,
    slug: String,
}

// #[derive(Debug, Serialize, Deserialize)]
// struct GroupPermissions {
//     values: Vec<GroupPermission>
// }
// #[derive(Debug, Serialize, Deserialize)]
// struct GroupPermission {
//     permission: String,
//
// }

struct Permission {
    object_type: ObjectType,
    alias: String,
    id: String,
    permission: PermissionType,
}

#[derive(Debug, Clone, Copy)]
enum ObjectType {
    User,
    Group,
}

fn object_type_from_str(s: &str) -> ObjectType {
    match s {
        "user" => return ObjectType::User,
        "group" => return ObjectType::Group,
        _ => return ObjectType::User,
    }
}

#[derive(Debug, Clone, Copy)]
enum PermissionType {
    Read,
    Write,
    Admin,
}
fn permission_type_from_str(s: &str) -> PermissionType {
    match s {
        "read" => return PermissionType::Read,
        "write" => return PermissionType::Write,
        "admin" => return PermissionType::Admin,
        _ => return PermissionType::Read,
    }
}

async fn list(bitbucket: Bitbucket) -> Result<Vec<Permission>, Box<dyn std::error::Error>> {
    let mut permissions: Vec<Permission> = Vec::new();

    let url = format!(
        r#"{}/repositories/{}/{}/permissions-config/groups"#,
        BASE_URL, bitbucket.workspace, bitbucket.slug,
    );
    let client = reqwest::Client::new();
    let resp = client
        .get(url)
        .basic_auth(&bitbucket.username, Some(&bitbucket.password))
        .send()
        .await?;

    if !resp.status().is_success() {
        println!("failed to get permission");
        return Ok(permissions);
    }

    let permission_groups: Value = resp.json().await?;

    for v in permission_groups["values"].as_array().unwrap() {
        let p = Permission {
            permission: permission_type_from_str(v["permission"].as_str().unwrap()),
            object_type: object_type_from_str(v["group"]["type"].as_str().unwrap()),
            alias: String::from(v["group"]["name"].as_str().unwrap()),
            id: String::from(v["group"]["slug"].as_str().unwrap()),
        };
        permissions.push(p);
    }

    let url_users = format!(
        r#"{}/repositories/{}/{}/permissions-config/users"#,
        BASE_URL, bitbucket.workspace, bitbucket.slug,
    );
    let resp_users = client
        .get(url_users)
        .basic_auth(bitbucket.username, Some(bitbucket.password))
        .send()
        .await?;

    if !resp_users.status().is_success() {
        println!("failed to get permission");
        return Ok(vec![]);
    }

    let permission_users: Value = resp_users.json().await?;

    for v in permission_users["values"].as_array().unwrap() {
        let p = Permission {
            permission: permission_type_from_str(v["permission"].as_str().unwrap()),
            object_type: object_type_from_str(v["user"]["type"].as_str().unwrap()),
            alias: String::from(v["user"]["nickname"].as_str().unwrap()),
            id: String::from(v["user"]["uuid"].as_str().unwrap()),
        };
        permissions.push(p);
    }

    for p in &permissions {
        println!(
            "{:?}, {:?}, {:?}, {:?}",
            p.object_type, p.id, p.alias, p.permission,
        );
    }

    Ok(permissions)
}

```
