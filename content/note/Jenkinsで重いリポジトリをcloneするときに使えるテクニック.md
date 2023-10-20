---
title: Jenkinsで重いリポジトリをcloneするときに使えるテクニック
date: 2022-05-26T14:45:00+09:00
tags:
- Jenkins
lastmod: 2022-05-26T14:45:00+09:00
---

shallow clone, sparse checkoutを使うことで、容量を軽くしてローカルに落とすことができる

![Pasted-image-20220705174631](note/Pasted-image-20220705174631.png)

Job DSLの場合

````groovy
pipelineJob('myJob') {
    definition {
        cpsScm {
            scm {
                git {
                    configure { git ->
                        // sparse checkout
                        git / 'extensions' / 'hudson.plugins.git.extensions.impl.SparseCheckoutPaths' / 'sparseCheckoutPaths' {
                            'hudson.plugins.git.extensions.impl.SparseCheckoutPath' {
                                path('src')
                            }
                        }

                        // shallow clone
                        git / 'extensions' / 'hudson.plugins.git.extensions.impl.CloneOption' {
                            shallow(true)
                            depth(1)
                            noTags(true)
                        }
                    }
                    remote {
                        url('https://bare.example.com/repository.git')
                        credentials('credential')
                    }
                    branch('master')
                }
            }
            lightweight(false)
            scriptPath("Jenkinsfile")
        }
    }
}
````
