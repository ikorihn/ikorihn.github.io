---
title: vue-awesome-swiperを使ってカルーセル風UIを作ってみた
date: "2021-01-31T00:18:00+09:00"
lastmod: '2021-05-30T18:49:28+09:00'
tags:
  - 'Vuejs'
  - 'TypeScript'
---

# vue-awesome-swiperを使ってカルーセル風UIを作ってみた

<https://github.surmon.me/vue-awesome-swiper/>
<https://swiperjs.com/swiper-api>

<https://www.kabanoki.net/4783/>
<https://mykii.blog/nuxt-vue-awesome-swiper/>
<https://webrandum.net/js-library-swiper/>

```sh
yarn add swiper vue-awesome-swiper
```

### globalに定義する

    import Vue from 'vue'
    import VueAwesomeSwiper from 'vue-awesome-swiper'

    // import style (>= Swiper 6.x)
    import 'swiper/swiper-bundle.css'

    // import style (<= Swiper 5.x)
    import 'swiper/css/swiper.css'

    Vue.use(VueAwesomeSwiper, /* { default options with global component } */)

### Vueコンポーネントに定義する

slide.js

```js
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'

// import style (>= Swiper 6.x)
import 'swiper/swiper-bundle.css'

// import style (<= Swiper 5.x)
import 'swiper/css/swiper.css'

export default {
  components: {
    Swiper,
    SwiperSlide
  },
  directives: {
    swiper: directive
  }
}
```

### 実践例

TypeScript で vue-property-decorator を使ってコンポーネントを作成

```ts
<template>
  <swiper
    ref="swiperSection"
    :options="swiperOption"
    @slide-change="onSlideChange"
  >
    <swiper-slide v-for="item in items" :key="item.id">
      <div>
        {{ item.name }}
      </div>
    </swiper-slide>
  </swiper>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import type { SwiperOptions } from 'swiper'
import SwiperClass from 'swiper'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/swiper-bundle.css'

@Component({
  components: {
    Swiper,
    SwiperSlide,
  },
})
export default class Slide extends Vue {
  items = [
    { id: 'cat', name: 'tama' },
    { id: 'dog', name: 'pochi' },
  ]


  $refs!: {
    swiperSection: InstanceType<typeof Swiper>
  }

  // Swiperの設定
  get swiperOption(): SwiperOptions {
    return {
      slidesPerView: 'auto',
      centeredSlides: true,
      initialSlide: 1,
      spaceBetween: 5,
    }
  }

  get swiper(): SwiperClass | null {
    return this.$refs.swiperSection.$swiper
  }

  /**
   * スライド変更イベントリスナー
   */
  onSlideChange() {
    if (!this.sectionSlider) {
      return
    }

    this.$emit('updateSlide', this.sectionSlider.activeIndex)
  }
}
</script>

<style scoped>
/* ライブラリで指定されているclassを上書き */
.swiper-slide:nth-child(odd) {
  background-color: #aebeff;
}
</style>
```

### Swiper6.x系を入れると、NavigationとPaginationが機能しない

<https://github.com/surmon-china/vue-awesome-swiper/issues/680>

    import Vue from 'vue'
    import { Swiper as SwiperClass, Pagination, Navigation } from 'swiper/swiper.esm'
    import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'

    // import style
    import 'swiper/swiper-bundle.min.css'

    SwiperClass.use([Pagination, Navigation])
    Vue.use(getAwesomeSwiper(SwiperClass))
