---
title: Nuxt.jsでRepositoryFactoryパターンを実装する
date: "2022-02-10T13:01:00+09:00"
tags:
  - 'TypeScript'
  - 'Vuejs'
lastmod: "2022-02-10T13:01:00+09:00"
---

[【フォースタ テックブログ】RepositoryFactoryパターンをVueのAPIリクエストに導入する - for Startups Tech blog](https://tech.forstartups.com/entry/2021/07/27/194946)
[Nuxt.js × typescriptで実装する api repositoryFactoryパターン | スマートショッピング](https://tech.smartshopping.co.jp/nuxt_typescript_repository_pattern)
[【Vue.js】Web API通信のデザインパターン (個人的ベストプラクティス) - Qiita](https://qiita.com/07JP27/items/0923cbe3b6435c19d761)

## RepositoryFactoryパターンとは

APIを呼び出す設計のデザインパターンとして、JorgeというVueエヴァンジェリストによって紹介された。
[Vue API calls in a smart way](https://medium.com/canariasjs/vue-api-calls-in-a-smart-way-8d521812c322)

- Repositoryによって、axiosインスタンスをコンポーネントに直接書くのを避けることができる
    - データの操作をビジネスロジックと分離する
    - エンドポイントの変更に強くなる
    - 再利用性が高まる
- Factoryによって、各ケースで必要なリポジトリをインスタンス化する
    - コンポーネントはRepositoryの実体化の方法を知らなくていい
    - テストのためのmockがしやすくなる

## 準備

```typescript:~/plugins/repository-api.ts
import { Context } from '@nuxt/types'
import { Inject, Plugin } from '@nuxt/types/app'
import {
  UserRepository,
} from '~/repositories/api'

/**
 * APIリクエストのインターフェース
 * グローバルに$repositoriesで呼び出すことができる
 * unit testのときはrepositoriesを差し替えることでmock可能
 */
export interface RepositoryApis {
  user: UserRepository
}

const plugin: Plugin = ({ $axios, $config }: Context, inject: Inject) => {
  const user = new UserRepository($axios)

  const repositories: RepositoryApis = {
    user,
  }
  inject('repositories', repositories)
}

export default plugin
```

```typescript:nuxt.config.ts
import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
    
  // ...
  plugins: [
    '~/plugins/repository-api',
  ],

}

export default config

```

```typescript:@types/vue-shim.d.ts
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { Consola } from 'consola'
import { Store } from 'vuex'
import { RepositoryApis } from '~/plugins/repository-api'

// axios, consola は関係ないが使うので入れておくとしたらこんな書き方
declare module 'vue/types/vue' {
  export interface Context {
    $axios: NuxtAxiosInstance
    $logger: Consola
    $repositories: RepositoryApis
  }
  interface Vue {
    $logger: Consola
    $repositories: RepositoryApis
  }
}

declare module '@nuxt/types' {
  export interface Context {
    $axios: NuxtAxiosInstance
    $logger: Consola
    $repositories: RepositoryApis
  }
  interface NuxtAppOptions {
    $logger: Consola
    $repositories: RepositoryApis
  }
}

declare module 'vuex/types' {
  interface Store<S> {
    $repositories: RepositoryApis
  }
}

```

```typescript:~/repositories/user.ts
import type { AxiosInstance } from 'axios'

export class UserRepository {
  private readonly axios: AxiosInstance

  constructor($axios: AxiosInstance) {
    this.axios = $axios
  }

  async search(id: string): Promise<User> {
    // this.$axios.get みたいな処理
  }
}
```

### 使い方

Vueコンポーネント内で `$repositories` で使用できる

```typescript
async fetchUser(id: string) {
    const data = await this.$repositories.user.search(id)
    return data
}
```

### テスト

```typescript:~/test/hoge.spec.ts
import { MockProxy, mock } from 'jest-mock-extended'
import { Context } from '@nuxt/types'
import { RepositoryApis } from '~/plugins/repository-api'
import { UserRepository } from '~/repositories/api'

describe('user', () => {
  let mockContext: MockProxy<Context>
  let repositories: MockProxy<RepositoryApis>

  beforeEach(() => {
    const mockUser = mock<UserRepository>()
    repositories = mock<RepositoryApis>()
    repositories.user = mockUser

    mockContext.$repositories = repositories
  })
    
  it('do something', () => {
    doSomething(mockContext)

    expect(repositories.user.search).toHaveBeenCalledTimes(1)
    expect(repositories.user.search).toHaveBeenCalledWith({
      id: 'foo',
    })
  })

})
```
