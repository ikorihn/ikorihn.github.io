---
title: typescript-TypeGuard
date: "2020-12-29T16:13:00+09:00"
tags:
  - TypeScript
lastmod: '2021-05-30T18:45:23+09:00'

---

[[TypeScript]]

# typescript TypeGuard

    class Animal {
    }

    class Duck extends Animal {
    }

    class Tiger extends Animal {
    }

    const isDuck = (animal: Animal): animal is Duck => 
            animal.type === 'duck' && animal.call !== undefined

    const animal = someFunc()
    if (isDuck(animal)) {
        animal.call()
    }
