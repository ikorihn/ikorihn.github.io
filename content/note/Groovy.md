---
title: Groovy
date: 2023-05-05T19:06:00+09:00
tags:
- Groovy
---

## operator overloading

[The Apache Groovy programming language - Operators](https://groovy-lang.org/operators.html#Operator-Overloading)

`+` `-` などのoperatorを再定義することができる。

https://github.com/jenkinsci/job-dsl-plugin/blob/master/job-dsl-core/src/main/groovy/javaposse/jobdsl/dsl/NodeEnhancement.groovy

````groovy
/**
 * Add div and leftShift operators to Node.
 * * div - Will return the first child that matches name, and if it doesn't exists, it creates
 * * leftShift - Take node (or configure block to create) and appends as child, as opposed to plus which appends as a
 *               peer
 */
@Category(Node)
class NodeEnhancement {
    private static final Logger LOGGER = Logger.getLogger(NodeEnhancement.name)

    Node div(Node orphan) {
        Node clonedOrphan = cloneNode(orphan)
        LOGGER.fine("Looking for child node ${clonedOrphan}")
        String childName = clonedOrphan.name()
        List children = this.children().findAll { child ->

....
````

https://github.com/jenkinsci/job-dsl-plugin/blob/master/docs/The-Configure-Block.md
https://stackoverflow.com/questions/27931795/how-to-refactor-common-jenkins-jobdsl-code

## this, owner, delegate

closure内で使うことができる変数。

* this クロージャを囲んでいるクラス
* owner クロージャを囲んでいるクラスか、クロージャを囲んでいるクロージャ
* delegate defaultではownerがセットされている。外から与えることもできる
  * It is a powerful concept for building domain specific languages in Groovy
  * The delegate of a closure can be changed to any object.

https://groovy-lang.org/closures.html#\_delegate_of_a_closure
[\[Groovy\]クロージャのthis、owner、delegateについて - Qiita](https://qiita.com/saba1024/items/b57c412961e1a2779881)

Job DSLではこのようにしてdelegateを使っている

https://github.com/jenkinsci/job-dsl-plugin/blob/master/job-dsl-core/src/main/groovy/javaposse/jobdsl/dsl/Job.groovy
[ContextHelper.executeInContext](https://github.com/jenkinsci/job-dsl-plugin/blob/master/job-dsl-core/src/main/groovy/javaposse/jobdsl/dsl/ContextHelper.groovy) で、`closure.delegate` にContextを差し込んでいる
ContextはJob DSLで定義しているクラス(多分groovy一般てわけじゃない)
https://github.com/jenkinsci/job-dsl-plugin/blob/master/job-dsl-core/src/main/groovy/javaposse/jobdsl/dsl/helpers/BuildParametersContext.groovy
