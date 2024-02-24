---
title: hubs_cloud
date: "2020-11-20T23:19:00+09:00"
lastmod: '2021-05-30T18:41:56+09:00'

---

# hubs_cloud

VR空間をデプロイできる

## リンク

-   [公式](https://hubs.mozilla.com/cloud)
-   [AWS Marketplace](https://aws.amazon.com/marketplace/pp/B084WNGRRP)
-   [日本語で試した人](https://mitomemel.hatenablog.com/entry/2020/05/09/120007)

## ユーザー制限

-   <https://hubs.mozilla.com/docs/hubs-faq.html#can-i-prevent-unregistered-attendees-from-attending-my-event>
    -   招待URLからのアクセスのみに絞ることは hubs.mozilla.com でもできる
    -   承認済みユーザーのみに絞るにはHubs Cloud
-   <https://hubs.mozilla.com/docs/hubs-cloud-limiting-user-access.html>
    -   you can create accounts for a list of emails or disable existing accounts
    -   Discord Bot OAuth もあるらしい

## 構成

<https://hubs.mozilla.com/docs/hubs-cloud-aws-architecture.html>

-   EC2

## コスト

-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-estimated-cost-charts.html>
    -   ccu(concurrent users)に応じてインスタンスタイプの目安決まる
-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-costs.html>
    -   Personal vs Enterprise
        -   サーバーが1台のみか、1台or複数台数が選べるかの違い
        -   multi serversの場合は2 app x 2 streamの4台が推奨
-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-costs.html#minimize-your-costs---a-user-story>
    -   普段はオフラインにする
    -   database pausingをONにする
    -   CDNにCloudflare workerをつかう
    -   イベント開始1.5H前にオンラインにする(起動に10分くらいかかる)、インスタンスタイプを上げる
-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-costs.html#factors-creating-aws-cost-estimates>
    -   AWS Server Type on AWS EC2 instances
    -   Number of servers
    -   Database usage (Aurora serverless)
    -   Storage for 3D assets for scenes and avatars (EFS)
    -   Data transfer costs (Cloudfront)
    -   Domain costs ($ 1 per domain/mo.) +  $0.40/mo for the database secrets
-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-costs.html#offline-mode---manual>
    -   offlineモード
    -   EC2とDBのコストはゼロになる
    -   backupとdataを保管するためのStorage料金のみ
-   <https://hubs.mozilla.com/docs/hubs-cloud-aws-estimated-ccu-limits.html>
    -   接続可能数

## カスタマイズ

-   <https://hubs.mozilla.com/docs/hubs-cloud-customizing-look-and-feel.html>
    -   企業ロゴ、テーマなどを設定できる

## セットアップ

<https://hubs.mozilla.com/docs/hubs-cloud-getting-started.html>
<https://hubs.mozilla.com/docs/hubs-cloud-aws-quick-start.html>

### ドメイン

<https://hubs.mozilla.com/docs/hubs-cloud-aws-domain-recipes.html>

> To make HC set up easier, we recommend setting up your domain's nameservers to point to AWS Route 53 as the hosting/DNS provider (AWS Route 53 Hosted Zones)

-   Route53でドメインを2個買うのが一番手っ取り早いっぽい？
    -   > we recommend setting up your domain's nameservers to point to AWS Route 53 as the hosting/DNS provider
    -   nameserverをRoute53に設定すればよさそう

-   USING the domains already? Already hosting something and can't change nameservers? Then use Recipe 3 for deployment
    -   Route53以外でも一応できる
    -   OR you have a SECOND LEVEL domain that is ".co.uk" or ".com.fr", there's a known bug that you need to follow the Recipe 3 for these domains.
    -   セカンドレベルドメインで使いたければ専用の手順へ

-   Recipe 1: Route53でルートドメインを持っている場合
    -   `myhub.com` または `hubs.myhub.com` をHubsに使える
    -   CFnがroot domain (myhub.com) の操作をする
    -   `myhub.com` がほかの用途に使われていない
    -   `anothersubdomain.myhub.com` が任意の用途に使える

-   Recipe 2: Route53にルートドメインがすでにあって、サブドメイン使う場合
    -   セカンドレベルドメイン(.co.jp)の場合はバグがあって使えないのでRecipe 3 へ
    -   mysite.com - Houses subdomain as Hub site domain name + the other sites or purposes at the root
    -   myhub.link - Short link domain name
    -   mysite-internal.com - Internal server domain. This can be any name you want, and will not be seen by users.

-   Recipe 3: Route53にドメインを作れない場合
    -   mysite.com CAN NOT be set up on Route 53
    -   mysite.com connects to your hub OR hub.mysite.com connects to your hub
    -   myhub.link - Short link domain name
    -   mysite-internal.com - Internal server domain + email domain. This can be any name you want, and will not be seen by users.
    -   (optional) mysite-mail.com - Email domain, if using mysite-internal.com for emails is not what you want.

## セットアップ後

<https://hubs.mozilla.com/docs/hubs-cloud-aws-updating-the-stack.html>

-   CloudFormationからstackをアップデート
-   オフラインにしたりDBのauto-posingを切り替えたり

## 日本語化

<https://mitomemel.hatenablog.com/entry/2020/05/09/120007>
<https://hubs.mozilla.com/docs/hubs-cloud-custom-clients.html>
