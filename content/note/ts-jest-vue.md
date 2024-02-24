---
title: ts-jest-vue
date: "2020-12-18T11:55:00+09:00"
tags: ['Vuejs']
---

# ts-jest vue

## 問題

Logo.spec.js -> Logo.spec.ts にリネームしてyarn testしたらエラー

test/Logo.spec.ts

```
import { mount } from '@vue/test-utils'
import Logo from '@/components/Logo.vue'

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Logo)
    expect(wrapper.vm).toBeTruthy()
  })
})
```

```
    test/Logo.spec.ts:2:20 - error TS2307: Cannot find module '@/components/Logo.vue' or its corresponding type declarations.

    2 import Search from '@/pages/search.vue'
                         ~~~~~~~~~~~~~~~~~~~~
```

## 対応

tsconfig.json
```
{
  "compilerOptions": {
    "types": [
      "@types/node",
      "@nuxt/types",
      "@types/jest"
    ]
  }
}
```

~/@types/vue-shim.d.ts を作成
ファイル名は何でもよさげ


``` typescript
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
```

=> `yarn test` が通るようになった

