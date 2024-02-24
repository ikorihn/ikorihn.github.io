---
title: Lambda関数に同時実行数を担保する
date: '2021-10-24T22:34:58+09:00'
tags:
  - AWS
  - Lambda
---
 

[Lambda 関数に冪等にする](https://aws.amazon.com/jp/premiumsupport/knowledge-center/lambda-function-idempotent/)

[Lambda 関数の同時実行数を1にしても冪等性の担保から逃れることは出来ない | by noid11 | Medium](https://medium.com/@noid11/lambda-%E9%96%A2%E6%95%B0%E3%81%AE%E5%90%8C%E6%99%82%E5%AE%9F%E8%A1%8C%E6%95%B0%E3%82%921%E3%81%AB%E3%81%97%E3%81%A6%E3%82%82%E5%86%AA%E7%AD%89%E6%80%A7%E3%81%AE%E6%8B%85%E4%BF%9D%E3%81%8B%E3%82%89%E9%80%83%E3%82%8C%E3%82%8B%E3%81%93%E3%81%A8%E3%81%AF%E5%87%BA%E6%9D%A5%E3%81%AA%E3%81%84-24a7e414933d)

> ・冪等性はお客様のコードで確保する必要がある
>
> -   AWS Lambda で保証しているのは最低1回実行することであり1回しか実行しないことではない
>
> -   同一イベントで同一 Lambda ファンクションが2回起動されることがまれに発生する
>
> -   DynamoDB を利用するなどして冪等性を担保する実装を行うこと



> 1. 入力イベントの固有属性の値を抽出します。(たとえば、トランザクションまたは購入 ID など。)
> 
> 2. 属性値がコントロールデータベース ([Amazon DynamoDB テーブル](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithTables.html)など) に存在するかどうかを確認します。  
> **注:** アーキテクチャに AWS サービスを追加すると、追加費用が発生する場合があります。詳細については、「[Amazon DynamoDB 料金](https://aws.amazon.com/dynamodb/pricing/)」および「[AWS 料金](https://aws.amazon.com/pricing/)」をご参照ください。
> 
> 3. 一意の値が存在する場合 (重複イベントを示す)、実行を正常に終了します (つまりエラーをスローすることがない)。一意の値が存在しない場合は、通常の実行を継続します。
> 
> 4. 関数の動作が正常に終了したら、コントロールデータベースにレコードが含まれます。
> 
> 5. 実行を終了します。
