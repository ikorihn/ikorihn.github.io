---
title: Vue.jsでGoogleMap上にアイコンを表示する
date: 2021-05-14T17:32:00+09:00
tags:
- TypeScript
- Vuejs
---

[Vue TypeScriptでGoogleMapを使う](note/Vue%20TypeScriptでGoogleMapを使う.md) でGoogle Mapを使えるようにした。
そこにアイコンを描画したい。

## 前提

* GoogleMapにアイコンを表示するには、画像ファイルを指定する
* Vue.jsのプロジェクトで、svgはすべて画像ファイルとしてではなく、Vueコンポーネントとして管理している
  * <https://jp.vuejs.org/v2/cookbook/editable-svg-icons.html> に則ってsvgを操作しやすいようにするため
* 画像ファイルがないので、どうやってGoogle Map上にアイコンを描画しようか考えた

`BaseIcon.vue`

````typescript
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" version="1.1">
    <slot />
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

export interface IconProp {
  width?: string
  height?: string
}

@Component
export default class BaseIcon extends Vue {
  @Prop({ type: String, default: '16' })
  private readonly width!: string

  @Prop({ type: String, default: '16' })
  private readonly height!: string
}
</script>
````

## data URL に変換する

コンポーネントをマウント
-> el要素からsvg文字列を抜き出す
-> svg文字列をbase64にして、data URLを作る

````typescript
/**
 * SVGコンポーネントを、svg画像のdata URLに変換する
 */
export const generateIconDataUrl = (
  icon: VueConstructor<Vue>,
  props?: IconProp
) => {
  const IconComponentConstructor = Vue.extend({
    components: {
      BaseIcon,
      icon,
    },
    props: {
      props: {
        type: Object,
        default: () => {},
      },
    },
    render: (h: Vue.CreateElement): Vue.VNode => {
      return h(BaseIcon, {
        props: {
          ...props,
        },
        scopedSlots: {
          default: (_props) => h(icon),
        },
      })
    },
  })
  // mountする
  const iconComponent = new IconComponentConstructor({
    propsData: { props },
  })
  iconComponent.$mount()

  // mountしたコンポーネントのHTML要素をsvgの文字列にシリアライズ
  const iconString = new XMLSerializer().serializeToString(iconComponent.$el)

  // svg文字列をBase64に変換して、data urlを作成
  // see https://developer.mozilla.org/ja/docs/Web/API/WindowOrWorkerGlobalScope/btoa
  return 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(iconString)
}
````

GoogleMapMarker.vue

````typescript
    this.marker = new this.google.maps.Marker({
      position: this.markerOption.position,
      map: this.map,
      icon: {
        url: generateGeneralIconDataUrl(
          PinIcon,
          { width: '32', height: '32' }
        ),
      },
    })
````
