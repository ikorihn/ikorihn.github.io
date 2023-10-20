---
title: Jenkins ビルドのChangeSetsを取得する
date: 2023-04-19T13:42:00+09:00
tags:
- 2023/04/19
- Jenkins
lastmod: 2023-04-19T13:42:00+09:00
---

[How to access Changelogs in a Pipeline Job?](https://docs.cloudbees.com/docs/cloudbees-ci-kb/latest/client-and-managed-masters/how-to-access-changelogs-in-a-pipeline-job)

````groovy
def changeSets = Jenkins.get().getItemByFullName("myjob").builds[0].changeSets

for (def changeSet: changeSets) {
    for (def entry: changeSet) {
        println "${entry.commitId} by ${entry.author} on ${new Date(entry.timestamp)}: ${entry.msg}"
        def files = new ArrayList(entry.affectedFiles)
        for (int k = 0; k < files.size(); k++) {
            def file = files[k]
            println "  ${file.editType.name} ${file.path}"
        }
    }
}

    ```

## Upstream buildを取得する
    
[how to get upstream build information in a script step of jenkins classic ui pipeline - Stack Overflow](https://stackoverflow.com/questions/70291635/how-to-get-upstream-build-information-in-a-script-step-of-jenkins-classic-ui-pip)
````
