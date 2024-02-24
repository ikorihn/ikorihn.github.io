---
title: Vue vuex_typescriptでjest
date: "2021-03-03T21:20:00+09:00"
lastmod: '2021-05-30T18:56:23+09:00'
tags:
  - 'Vuejs'
  - 'TypeScript'
  - 'unittest'
---

# vuex_typescriptでjest

middlewareをテストする場合を考える。

~/middleware/user.ts

    import { Context, Middleware } from '@nuxt/types'
    import { user } from '~/store'

    const middleware: Middleware = (context: Context) => {
      // ページ遷移のたびに実行したい処理を書く
      if (user.expiration > new Date()) {
        user.update(false)
        context.redirect('/error')
      }
    }

    export default middleware

~/test/middleware/user.spec.ts

    import { createLocalVue } from '@vue/test-utils'
    import { MockProxy, mock } from 'jest-mock-extended'
    import MockDate from 'mockdate'
    import Vuex, { Store } from 'vuex'
    import { Context } from '@nuxt/types'
    import { initializeStores, user } from '~/store'
    import middleware from '~/middleware/user'

    describe('middleware', () => {
      const localVue = createLocalVue()
      localVue.use(Vuex)

      // jest-mock-extended を使って @nuxt/types/Context をmock
      let mockContext: MockProxy<Context>

      let store: Store<{}>
      let getters

      // @nuxt/types/Middleware が string | Function のunion typeなためエラーになるので、型を絞り込む
      // This expression is not callable.
      // Not all constituents of type 'Middleware' are callable.
      // Type 'string' has no call signatures
      const middlewareFunc = middleware as (ctx: Context) => Promise<void> | void

      beforeEach(() => {

        // gettersをmock
        getters = {
          'user/expiration': jest.fn(() => new Date(1614700000)),
        }
        // Vuexの初期化
        store = new Vuex.Store({
          state: {},
          getters,
        })
        initializeStores(store)

        mockContext = mock<Context>()
      })

      it('success', () => {

        // mockdate を使用してnew Date()をmock
        MockDate.set('2021-01-02T15:04:05+09:00')

        user.update = jest.fn()

        // context.redirect をmock
        ;(mockContext.redirect as jest.Mock) = jest.fn(() => {})

        middlewareFunc(mockContext)

        expect(mockContext.redirect).toHaveBeenCalledTimes(0)
      })

    })


