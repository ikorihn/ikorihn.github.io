---
title: Haversineの公式で2地点の距離を求める
date: 2024-01-24T11:55:00+09:00
tags:
  - Go
---

Haversineの公式についてはこちらのとおり

{{< card-link "https://en.wikipedia.org/wiki/Haversine_formula" >}}

$$
D = 2r \times \arcsin \left( \sqrt{\sin^2\frac{\phi_2 - \phi_1}{2} + \cos(\phi_1)\times\cos(\phi_2)\times\sin^2\frac{{\lambda_2 - \lambda_1}}{2}} \right)
$$

- φ = 緯度、λ = 経度 を表す
- r は地球の赤道半径 正確には 6378137m で計算する

```go
// 地球の赤道半径(m)
const earthRadius = 6378137

func deg2Rad(deg float64) float64 {
	return deg * math.Pi / 180
}

func HaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {

	lat1 = deg2Rad(lat1)
	lon1 = deg2Rad(lon1)
	lat2 = deg2Rad(lat2)
	lon2 = deg2Rad(lon2)
	Δlat := lat2 - lat1
	Δlon := lon2 - lon1

	haversine := math.Pow(math.Sin(Δlat/2), 2) + math.Cos(lat1)*math.Cos(lat2)*math.Pow(math.Sin(Δlon/2), 2)
	distance := earthRadius * 2 * math.Asin(math.Sqrt(haversine))

	return distance
}
```

[２地点間の距離と方位角 - 高精度計算サイト](https://keisan.casio.jp/exec/system/1257670779) で計算した結果を使って確認する

```go
func TestHaversine(t *testing.T) {
	type testdata struct {
		pos  []float64
		want float64
	}
	tests := []testdata{
		{[]float64{32.460532, 148.277413, 43.082688, 135.780823}, 1611157.37},
		{[]float64{43.589614, 127.127637, 34.173733, 146.384106}, 1963229.67},
		{[]float64{32.950498, 132.119801, 33.664021, 133.077181}, 119339.55},
		{[]float64{34.125722, 133.046361, 34.059234, 133.790232}, 68973.67},
		{[]float64{34.125722, 133.046361, 34.129234, 133.090232}, 4061.54},
		{[]float64{34.125722, 133.046361, 34.125634, 133.046232}, 15.4},
	}

	for i, tt := range tests {
		t.Run(fmt.Sprintf("%d", i), func(t *testing.T) {
			got := HaversineDistance(tt.pos[0], tt.pos[1], tt.pos[2], tt.pos[3], tt.want)
			assert.InDelta(t, tt.want, got, 0.1)
		})
	}
}
```
