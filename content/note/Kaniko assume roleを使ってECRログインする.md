---
title: Kaniko assume roleを使ってECRログインする
date: "2023-02-10T16:24:00+09:00"
tags:
  - '2023/02/10'
  - 'Docker'
  - 'Kubernetes'
---


[kaniko が何をしているか, 何ができるか - 薄いブログ](https://orisano.hatenablog.com/entry/2019/05/20/120032)
[Container Image Building with Kaniko](https://www.giantswarm.io/blog/container-image-building-with-kaniko)


[Kaniko Image Cache in Jenkins Kubernetes Agents - Stack Overflow](https://stackoverflow.com/questions/72754983/kaniko-image-cache-in-jenkins-kubernetes-agents)

- `/kaniko/.docker/config.json` に
```json
{
  "credsStore": "ecr-login"
}
```

```groovy
pipeline {
    agent {
        kubernetes {
          label "kaniko"
          yaml '''
          spec:
            volumes:
              - name: cache
                emptyDir: {}
            containers:
            - name: kaniko
              image: gcr.io/kaniko-project/executor:debug
              imagePullPolicy: IfNotPresent
              volumeMounts:
              - mountPath: /mnt/cache
                name: cache
              command:
              - /busybox/cat
              tty: true
            - name: awscli
              image: public.ecr.aws/aws-cli/aws-cli:latest
              imagePullPolicy: IfNotPresent
              args:
                - "9999999"
              command:
              - sleep
              tty: true
          '''.stripIndent()

        }
    }

    stages {
        stage('Login'){
            steps{
                container(name: 'awscli') {
                    script {
                        def credentialText = sh(
                          script: 'aws sts assume-role --role-arn "$ROLE_ARN"',
                          returnStdout: true
                        ).trim()
                        def credential = new groovy.json.JsonSlurper().parseText(credentialText)

                        // 環境変数にセット
                        env.AWS_ACCESS_KEY_ID = credential['Credentials']['AccessKeyId']
                        env.AWS_SECRET_ACCESS_KEY = credential['Credentials']['SecretAccessKey']
                        env.AWS_SESSION_TOKEN = credential['Credentials']['SessionToken']
                    }
                }
            }
        }

        stage('Warm'){
            steps{
                container(name: 'kaniko', shell: '/busybox/sh') {
                    sh '''
                    /kaniko/warmer --cache-dir=/mnt/cache --image=<IMAGE_FROM_ECR> -v debug
                    '''.stripIndent()
                }
            }
        }

        stage('Build & Cache Image'){
            steps{
                container(name: 'kaniko', shell: '/busybox/sh') {
                    sh '''
                    echo hello > tmp.txt

                    cat <<EOF > Dockerfile
                    FROM <IMAGE_FROM_ECR>
                    COPY tmp.txt /usr/local/tomcat/
                    EOF

                    /kaniko/executor --context . --dockerfile Dockerfile --destination=kaniko-sample --cache-dir=/mnt/cache --no-push --tarPath out.tar
                    '''.stripIndent()
                }
            }
        }
    }
}
```
