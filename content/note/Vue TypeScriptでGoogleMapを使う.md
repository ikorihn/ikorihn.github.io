---
title: Vue TypeScriptでGoogleMapを使う
date: 2021-01-31T00:11:00+09:00
tags:
- Vuejs
- TypeScript
---

# Vue.js+TypeScriptでGoogleMapを使う

## Vue.js公式のcookbookにexampleが乗ってる

* <https://jp.vuejs.org/v2/cookbook/practical-use-of-scoped-slots.html>
* slotを使ってGoogle Mapをロードする用のコンポーネントを作成
* scoped slotでgoogle, map propertyを公開する
* 親コンポーネントで、slotのpropertyを使ってmarkerやpolylineを描画するのに使う
* markerコンポーネントを作ってpropsにgoogleやmapを渡すことで使うことができる

## TypeScript

<https://developers.google.com/maps/documentation/javascript/using-typescript>

<https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/googlemaps/>
DefinitelyTypedにあるものを使う

## Vue.js

* <https://jp.vuejs.org/v2/cookbook/practical-use-of-scoped-slots.html> に則って実装
* [@googlemaps/js-api-loader](https://www.npmjs.com/package/@googlemaps/js-api-loader) でロード
* [@types/googlemaps](https://www.npmjs.com/package/@types/googlemaps) で型付け

GoogleMapLoader.vue

````typescript
<template>
  <div>
    <div ref="googleMap" class="google-map h-full"></div>
    <template v-if="google && map">
      <slot :google="google" :map="map" />
    </template>
  </div>
</template>

<script lang="ts">
import { Loader } from '@googlemaps/js-api-loader'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class GoogleMapLoader extends Vue {
  @Prop({ type: Object })
  mapConfig?: google.maps.MapOptions

  @Prop({ type: String })
  apiKey?: string

  @Prop({ type: String })
  apiVersion?: string

  google: typeof google | null = null
  map: google.maps.Map | null = null

  $refs!: {
    googleMap: Element
  }

  mounted() {
    const loader = new Loader({
      apiKey: this.apiKey || this.$config.googleMapsApi.key!,
      version: this.apiVersion || this.$config.googleMapsApi.version!,
    })

    loader
      .load()
      .then(() => {
        this.google = window.google
        const mapContainer = this.$refs.googleMap
        this.map = new this.google.maps.Map(mapContainer, {
          ...this.mapConfig,
        })

        this.$emit('map-loaded')
      })
      .catch((e) => {
        this.$emit('failed-map-loading')
      })
  }

  // Mapを操作するためにメソッドを公開
  // this.$refs.map.setCenter(latLng) のように呼び出す
  setCenter(latLng: google.maps.LatLng) {
    if (!this.google || !this.map) {
      return
    }
    this.map.setCenter(latLng)
  }
}
</script>

````

GoogleMapMarker.vue

````typescript
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class GoogleMapMarker extends Vue {
  @Prop({ type: Object, required: true })
  google!: typeof google

  @Prop({ type: Object, required: true })
  map!: google.maps.Map

  @Prop({ type: String, required: true })
  url!: string

  @Prop({ type: Object, required: true })
  position!: google.maps.LatLng

  marker: google.maps.Marker | null = null

  mounted() {
    this.marker = new this.google.maps.Marker({
      position: this.position,
      map: this.map,
      icon: {
        url: this.url,
      },
    })
  }
}
</script>
````

### 困ったこと

#### `@types/googlemaps`の定義がnamespaceになっているのでそのままだとgoogle型が使えない

````
declare namespace google.maps {
	...
}
````

##### 解決策

`typeof google` で型宣言する

````
  // eslint-disable-next-line no-undef
  let google: typeof google | null = null
````

#### VeturでNull-safety operatorが怒られる(バグ？)

````
  initializeMap() {
    const mapContainer = this.$refs.googleMap
    this.map = new this.google?.maps.Map(mapContainer, this.mapConfig)
  }
````

````
This expression is not constructable.  
Type 'typeof google' has no construct signatures.Vetur(2351)
````

##### 解決策

あらかじめnull判定をしておく

````
  initializeMap() {
    const mapContainer = this.$refs.googleMap
    if (!this.google) {
      return
    }
    this.map = new this.google.maps.Map(mapContainer, this.mapConfig)
  }
````

## その他ドキュメント

<https://developers.google.com/maps/documentation/javascript/examples/event-simple>
