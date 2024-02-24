---
title: css 吹き出しをつくる
date: "2021-05-30T18:49:00+09:00"
tags:
  - 'css'
---

# CSSで吹き出しを作る

<https://lpeg.info/html/css_bubble.html>

Vueコンポーネント+TailwindCSSでの書き方

したむきの枠線つき吹き出し

```vue
<template>
  <div
    class="speech-balloon relative inline-block rounded-3xl border border-gray-2 py-xxs px-m bg-white text-black text-center text-base"
    @click="$emit('click')"
  >
    {{ text }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

/**
 * 吹き出し
 */
@Component
export default class SpeechBalloon extends Vue {
  @Prop({ required: true, type: String })
  readonly text!: string
}
</script>

<style scoped>
.speech-balloon:before {
  @apply absolute;
  @apply z-20;

  content: '';
  top: 100%;
  left: 50%;
  margin-left: calc(0px - theme('spacing.s'));
  border: theme('spacing.s') solid transparent;
  border-top: theme('spacing.s') solid theme('colors.white');
}

/* 下に載せる三角アイコン */
.speech-balloon:after {
  @apply absolute;
  @apply z-10;

  content: '';
  top: 100%;
  left: 50%;
  margin-left: calc(0px - theme('spacing.s') - 2px);
  border: calc(theme('spacing.s') + 2px) solid transparent;
  border-top: calc(theme('spacing.s') + 1px) solid theme('colors.gray.2');
}
</style>
```
