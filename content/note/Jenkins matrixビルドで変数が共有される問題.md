---
title: Jenkins matrixビルドで変数が共有される問題
date: "2023-02-13T12:50:00+09:00"
tags:
  - '2023/02/13'
  - 'Jenkins'
---

matrixを使ってふたつのworker上でビルドしたいとき、実行順によっては

```groovy
pipeline {
    agent none
    stages {
        stage('parallel') {
            matrix {
                agent {
                    label "worker-${ARCH}"
                }
                axes {
                    axis {
                        name 'ARCH'
                        values 'x86_64', 'armv8'
                    }
                }

                stages {

                    stage('prepare') {
                      steps {
                        script {
                          env.KEY = "key_${ARCH}"
                        }
                      }
                    }

                    stage('build') {
                        steps {
                            sh '''
                            echo "${ARCH} ${KEY}"
                            '''
                        }
                    }
                }
            }
        }

    }
}
```

worker-x86_64 prepare -> worker-x86_64 build -> worker-armv8 prepare -> worker-armv8 build の順に実行されれば問題ないが、
worker-x86_64 prepare -> worker-armv8 prepare -> worker-x86_64 build -> worker-armv8 build の順に実行されると、あとから実行されたものに上書きされる

```
x86_64 key_armv8
armv8 key_armv8
```

そのため別の変数で格納する必要がある

```groovy
pipeline {
    agent none
    stages {
        stage('parallel') {
            matrix {
                agent {
                    label "worker-${ARCH}"
                }
                axes {
                    axis {
                        name 'ARCH'
                        values 'x86_64', 'armv8'
                    }
                }

                stages {

                    stage('prepare') {
                      steps {
                        script {
                          if (ARCH == "armv8") {
                            env.KEY_ARM = "key_arm"
                          } else {
                            env.KEY_AMD = "key_amd"
                          }
                        }
                      }
                    }

                    stage('build') {
                        steps {
                            sh '''
                            if [[ "${ARCH}" == "armv8" ]]; then
                              export KEY=${KEY_ARM}
                            else
                              export KEY=${KEY_AMD}
                            fi
                            echo "${ARCH} ${KEY}"
                            '''
                        }
                    }
                }
            }
        }

    }
}
```
