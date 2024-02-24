---
title: Jenkins ビルドの最終更新時刻を確認する
date: "2023-05-05T20:29:00+09:00"
tags:
  - Jenkins
---

[[Jenkins]] でビルドの最終更新時刻を確認する

```groovy
import java.time.ZoneOffset
import java.time.Instant
import java.time.temporal.ChronoUnit
def builds = Jenkins.get().getAllItems(Job.class).collectMany { job ->
        job.builds
    }.findAll { build ->
        build.building
    }	

println builds.size()
builds.each {
  println "${it.url} hasntStartedYet: ${it.hasntStartedYet()} , isInProgress: ${it.isInProgress()} , isLogUpdated: ${it.isLogUpdated()} , getTime: ${it.time} , getStartTimeInMillis: ${java.time.Instant.ofEpochMilli(it.getStartTimeInMillis()).atOffset(ZoneOffset.ofHours(9)).toString()} , logfile: ${java.time.Instant.ofEpochMilli(it.logFile.lastModified()).atOffset(ZoneOffset.ofHours(9)).toString()}"
  it.doStop()
}

println ""
```


```groovy
import java.time.ZoneOffset
import java.time.Instant
import java.time.temporal.ChronoUnit

pipeline {
    agent none
    stages {
        stage('find') {
            steps {
                script {
                    def builds = findNotStoppedJobs()
                    if (builds.size() == 0) {
                        println '実行中のジョブなし'
                        return
                    }

                    // Nodeの情報をログに残す
                    println "---- print all Node ----"
                    Jenkins.get().nodes.each { node ->
                        println "---- Node ${node.getSelfLabel()} ----"
                        printNodeInfo(node)
                        println ""
                    }

                    def now = Instant.now()
                    def stoppedBuilds = []
                    builds.each { build ->
                        def lastModified = Instant.ofEpochMilli(build.logFile.lastModified())

                        def matcher = build.log =~ /Cannot contact ([^:]*).*/
                        if (lastModified.plus(5, ChronoUnit.MINUTES).isBefore(now) && matcher.size() > 0 && matcher[0].size() > 1) {
                            // slaveとの通信ができなくなって一定時間経過している場合

                            println "---- ${build.url} ----"

                            def nodeLabel = matcher[0][1]
                            def node = Jenkins.get().getNode(nodeLabel)
                            if (node == null) {
                                println "Node ${nodeLabel} の情報が取得できませんでした。podが停止した可能性があるためビルドを停止します"
                                stopBuild(build)
                                stoppedBuilds.add(build)
                            } else {
                                printNodeInfo(node)
                                if (node.channel == null) {
                                    println "Node ${nodeLabel} のchannelが取得できませんでした。podが停止した可能性があるためビルドを停止します"
                                    stopBuild(build)
                                    stoppedBuilds.add(build)
                                }
                            }
                            return
                        }

                    }

                    if (stoppedBuilds.size() == 0) {
                        println '停止したジョブはありません'
                        return
                    }

                }
            }
        }
    }
}

def findNotStoppedJobs() {
    return Jenkins.get().getAllItems(Job.class).collectMany { job ->
        job.builds
    }.findAll { build ->
        build.building
    }
}

def printNodeInfo(def node) {
    println "getAssignedLabels()          : ${node.getAssignedLabels()              }"
    println "getChannel()                 : ${node.getChannel()                     }"
    println "getDisplayName()             : ${node.getDisplayName()                 }"
    println "getLabelString()             : ${node.getLabelString()                 }"
    println "getMode()                    : ${node.getMode()                        }"
    println "getNodeDescription()         : ${node.getNodeDescription()             }"
    println "getNodeName()                : ${node.getNodeName()                    }"
    println "getRootPath()                : ${node.getRootPath()                    }"
    println "getSearchUrl()               : ${node.getSearchUrl()                   }"
    println "getSelfLabel()               : ${node.getSelfLabel()                   }"
    println "isAcceptingTasks()           : ${node.isAcceptingTasks()               }"
    println "isHoldOffLaunchUntilSave()   : ${node.isHoldOffLaunchUntilSave()       }"
}

def stopBuild(def build) {
    build.doStop()
}

```
