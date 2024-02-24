---
title: vue-property-decoratorを使ったTypeScriptなVueファイルをCompositionAPIに移行する
date: '2022-05-13T12:26:00+09:00'
tags:
  - 'Vuejs'
  - 'TypeScript'
---

class componentは非推奨になったわけではなくて今後も使えるそうですが、
TypeScriptで書く場合にVolarの恩恵を最大限受けるために、Composition APIのスタイルに書き換えました。
ついでにscript setupにもしています。

## Composition APIへの書き換え

参考: [From vue-class-component to Composition API | by Giacomo Voß | Level Up Coding](https://levelup.gitconnected.com/from-vue-class-component-to-composition-api-ef3c3dd5fdda)

### 概観

vue-class-component(vue-property-decorator) で書かれたVueコンポーネントをscript setupに書き換えると以下のようになります。

```vue
<template>
  <button type="button" @click="handleClick">
    {{ text }}
    <IconButton />
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import IconButton from '@/components/atoms/IconButton.vue'

@Component({
  components: {
    IconButton,
  },
})
export default class ButtonPrimary extends Vue {
  @Prop({ type: String, required: true })
  private readonly text!: string

  @Emit('clickButton')
  handleClick() {}
}
</script>
```

```vue
<template>
  <button type="button" @click="handleClick">
    {{ text }}
    <IconButton />
  </button>
</template>

<script lang="ts" setup>
import IconButton from '@/components/atoms/IconButton.vue'

interface Props {
  text: string
}
defineProps<Props>()

defineEmits<{
  (e: 'clickButton'): void
}>()
</script>
```

以下個別に見ていきます。

### @Component

class component

```vue
<template>
  <div>
    <ChildComponent1 />
    <ChildComponent2 />
  </div>
</template>

<script lang="ts">
import ChildComponent1 from './ChildComponent1.vue'
import ChildComponent2 from './ChildComponent2.vue'

@Component({
  components: {
    ChildComponent1,
    ChildComponent2,
  },
})
export default class MyComponent extends Vue {

}
</script>
```

script setup

```vue
<template>
  <div>
    <ChildComponent1 />
    <ChildComponent2 />
  </div>
</template>

<script setup lang="ts">
import ChildComponent1 from './ChildComponent1.vue'
import ChildComponent2 from './ChildComponent2.vue'
</script>
```

import文を書くだけでコンポーネントを使用できるようになりました。

## Data

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  message = 'Hello'

  onInput(value: string) {
    this.message = value
  }
}
</script>
```

script setup

```vue
<script setup lang="ts">
const message = ref('Hello')

const onInput = (value: string) => {
  message.value = value
}
</script>
```

`ref` で宣言することでreactiveな値として使用できるようになります。
値にアクセスするには `.value` をつける必要があります。

### @Prop

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  @Prop({ type: String, required: true })
  private readonly text!: string

  // default値
  @Prop({ type: Number, default: 2 })
  private readonly num!: number

  // Object
  @Prop({ type: Object, required: true })
  private readonly myObj!: MyObj

}
</script>
```

script setup

```vue
<script setup lang="ts">
interface Props {
  text: string
  num?: number
  myObj: MyObj
}
const props = withDefaults(defineProps<Props>(), {
  num: 2,
})

</script>
```

独自型もきちんと型を付けられるようになり、コンポーネントを利用する側でも補完が効くようになります。

### @Emit

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  @Emit('clickButton')
  handleClick(num: number) {
    return num
  }

}
</script>
```

script setup

```vue
<script setup lang="ts">
const emits = defineEmits<{
  (e:'click-button', num: number): void
}>()

const handleClick = (num: number) => {
  emits('click-button', num)
}
</script>
```

### @Watch

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  checkBox: boolean = false

  @Watch('checkBox')
  watchValue(value: boolean) {
    if (value) {
        alert('checked!!')
    }
  }
}
</script>
```

script setup

```vue
<script setup lang="ts">
const checkBox = ref(false)

watch(
  checkBox,
  (value: boolean) => {
    if (value) {
        alert('checked!!')
    }
  }
)
</script>
```

### @Ref

class component

```vue
<template>
  <ChildComponent ref="childComponent" />
  <button ref="submitButton">Submit</button>
</template>

<script lang="ts">
import ChildComponent from './ChildComponent.vue'

@Component
export default class MyComponent extends Vue {
  @Ref() readonly childComponent!: ChildComponent
  @Ref('submitButton') readonly button!: HTMLButtonElement
}
</script>
```

script setup

```vue
<template>
  <ChildComponent ref="childComponent" />
  <button ref="submitButton">Submit</button>
</template>

<script setup lang="ts">
const childComponent = ref<ChildComponent>()
const submitButton = ref<HTMLButtonElement>()
</script>
```

同じ変数名のrefで宣言するだけで参照できるようになりました

### Computed

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  firstName = 'John'
  lastName = 'Doe'

  get name() {
    return this.firstName + ' ' + this.lastName
  }

  set name(value) {
    const splitted = value.split(' ')
    this.firstName = splitted[0]
    this.lastName = splitted[1] || ''
  }
}
</script>
```

script setup

```vue
<script setup lang="ts">
const firstName = ref('John')
const lastName = ref('Doe')

const name = computed({
  get: () =>  firstName + ' ' + lastName,
  set: (value) => {
    const splitted = value.split(' ')
    firstName.value = splitted[0]
    lastName.value = splitted[1] || ''
  }
})

</script>
```

### Hooks

class component

```vue
<script lang="ts">
@Component
export default class MyComponent extends Vue {
  mounted() {
    console.log('mounted')
  }
}
</script>
```

script setup

```vue
<script setup lang="ts">
onMounted(() => {
  console.log('mounted')
})
</script>
```

ライフサイクルフックの変更はこちらを参照
[ライフサイクルフック | Vue.js](https://v3.ja.vuejs.org/guide/composition-api-lifecycle-hooks.html)

- setup は beforeCreate と created のライフサイクルで実行されるため、これらのフック内で実行していたコードはsetup内に直接書く
- mounted -> onMounted のように、onXXXXXという名前に変わった

## モジュールやライブラリの移行

- vuex -> pinia
  - <https://github.com/Seb-L/pinia-plugin-persist>
