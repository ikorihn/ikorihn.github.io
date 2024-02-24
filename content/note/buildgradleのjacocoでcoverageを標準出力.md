---
title: buildgradleのjacocoでcoverageを標準出力
date: "2021-03-04T17:33:00+09:00"
lastmod: '2021-05-30T18:53:23+09:00'
tags:
  - unittest 
  - gradle
---

# jacoco_coverageを標準出力

```kotlin
tasks.withType<JacocoReport> {
    dependsOn(tasks.test)

    reports {
        xml.isEnabled = true
        html.isEnabled = true
    }

    doLast {
        val report = File("${jacoco.reportsDir}/test/jacocoTestReport.xml")
        printCoverage(report)
    }
}

/**
 * JaCoCo のテストレポート(xml)をparseしてカバレッジを標準出力する
 */
fun printCoverage(xml: File) {
    if (!xml.exists()) return

    val documentBuilder = javax.xml.parsers.DocumentBuilderFactory.newInstance()
        .apply {
            // DTDが見つからないエラーが出るため抑制
            isValidating = false
            isNamespaceAware = true
            setFeature("http://xml.org/sax/features/namespaces", false)
            setFeature("http://xml.org/sax/features/validation", false)
            setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false)
            setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)
        }
        .newDocumentBuilder()
    val document = documentBuilder.parse(xml)

    val xPath = javax.xml.xpath.XPathFactory.newInstance().newXPath()

    val counters =
        xPath.evaluate("/report/counter", document, javax.xml.xpath.XPathConstants.NODESET) as org.w3c.dom.NodeList

    val metrics = mutableMapOf<String, Double>()
    for (i in 0 until counters.length) {
        val counter = counters.item(i)
        val typeName = counter.attributes.getNamedItem("type").nodeValue
        val missed = counter.attributes.getNamedItem("missed").nodeValue.toDouble()
        val covered = counter.attributes.getNamedItem("covered").nodeValue.toDouble()
        val coverage = ((covered / (covered + missed)) * 10000).roundToInt().toDouble() / 100.toDouble()

        metrics[typeName] = coverage
    }

    logger.quiet("----- Code Coverage ----------")
    metrics.entries.forEach { entry ->
        val key = entry.key
        val value = entry.value
        logger.quiet(String.format(" - %-12s: %6.2f%%", key, value))
    }
    logger.quiet("------------------------------")
}
```

```sh
$ ./gradlew jacocoTestReport

> Task :jacocoTestReport
----- Code Coverage ----------
 - INSTRUCTION :  99.99%
 - BRANCH      :  99.99%
 - LINE        :  99.99%
 - COMPLEXITY  :  99.99%
 - METHOD      :  99.99%
 - CLASS       :  99.99%
------------------------------
```
