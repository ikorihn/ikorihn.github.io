---
title: Python CSVを1行ずつ読み込んで型に当てはめる
date: 2024-03-04T15:16:00+09:00
tags:
  - Python
---

[[Python]] でヘッダー付きのCSVを読み込んで、カラム名でアクセスするには [csv.DictReader](https://docs.python.org/ja/3/library/csv.html) を使うとできる。
これは行をdictに変換してくれるもので、これはこれで便利なのだがClassに当てはめてもっと扱いやすくできないかを調べた。

それには [dataclassesモジュール](https://docs.python.org/ja/3/library/dataclasses.html)でClassを定義するとよい。
これはPython 3.7で追加された標準ライブラリで、データクラス（Data Classes）を定義するための機能を提供する。

以下のようにして、dictをコンストラクタに渡してインスタンスを生成するとよい。field名とカラム名が一致していればこれでいい。

```python
import csv
from dataclasses import dataclass

@dataclass
class MyData:
    column1: str
    column2: int


csvfile = """column1,column2
John,30
Alice,50
Bob,70
""".split("\n")

reader = csv.DictReader(csvfile)
for row in reader:
    # 行をMyDataのインスタンスとして扱う
    data_row: MyData = MyData(**row)
    print(data_row)
```

