---
title: JenkinfsfileをCIでvalidateしたい
date: 2022-07-07T11:27:00+09:00
tags:
- Jenkins
lastmod: 2022-07-07T11:27:00+09:00
---

[Jenkins: How do I lint Jenkins pipelines from the command line? - Stack Overflow](https://stackoverflow.com/questions/44703012/jenkins-how-do-i-lint-jenkins-pipelines-from-the-command-line)
https://www.jenkins.io/doc/book/pipeline/development/

起動中の [note/Jenkins](Jenkins.md) にcurlやsshしてvalidateのAPIを叩くとチェックできる

Linting via the CLI with SSH

````shell
# ssh (Jenkins CLI)
# JENKINS_SSHD_PORT=[sshd port on controller]
# JENKINS_HOSTNAME=[Jenkins controller hostname]
ssh -p $JENKINS_SSHD_PORT $JENKINS_HOSTNAME declarative-linter < Jenkinsfile
````

Linting via HTTP POST using curl

````shell
# curl (REST API)
# Assuming "anonymous read access" has been enabled on your Jenkins instance.
# JENKINS_URL=[root URL of Jenkins controller]
# JENKINS_CRUMB is needed if your Jenkins controller has CRSF protection enabled as it should
JENKINS_CRUMB=`curl "$JENKINS_URL/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)"`
curl -X POST -H $JENKINS_CRUMB -F "jenkinsfile=<Jenkinsfile" $JENKINS_URL/pipeline-model-converter/validate
````

それをnpmコマンドでできるようにしたものがこちら

[Jenkinsfileのlintで救える命がある](https://www.slideshare.net/miyajan/jenkinsfilelint)
[jflint - npm](https://www.npmjs.com/package/jflint)

## linter

https://github.com/nvuillam/npm-groovy-lint というのもある
