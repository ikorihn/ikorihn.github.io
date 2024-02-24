---
title: DBUnitでPotential problem foundのWARNが出る
date: "2021-06-04T17:36:00+09:00"
lastmod: '2021-06-04T17:38:29+09:00'
tags:
  - 'Java'

---

#Java

DBUnit を実行すると `Potential problem found: The configured data type factory 'class org.dbunit.dataset.datatype.DefaultDataTypeFactory' might cause problems with the current database` と怒られるのを解決した

## 事象

```txt
[main] WARN org.dbunit.dataset.AbstractTableMetaData - Potential problem found: The configured data type factory 'class org.dbunit.dataset.datatype.DefaultDataTypeFactory' might cause problems with the current database 'H2' (e.g. some datatypes may not be supported properly). In rare cases you might see this message because the list of supported database products is incomplete (list=[derby]). If so please request a java-class update via the forums.If you are using your own IDataTypeFactory extending DefaultDataTypeFactory, ensure that you override getValidDbProducts() to specify the supported database products.
```

DefaultDataTypeFactory だと DBMS 依存の型が解決できない可能性があるから、使ってる DBMS 用の DataTypeFactory を使えという趣旨

## 解決策

<http://dbunit.sourceforge.net/faq.html#typefactory>

configのDATATYPE_FACTORYに、使っているDBのFactoryをセットしてあげればよい

```java
IDatabaseConnection connection = new DatabaseConnection(jdbcConnection, schema);
DatabaseConfig config = connection.getConfig();
config.setProperty(DatabaseConfig.PROPERTY_DATATYPE_FACTORY, new OracleDataTypeFactory());
```


## JdbcDataTesterを使っている場合

こんな感じでDBのセットアップをしていた

```java
void cleanlyInsert(final IDataSet dataSet) throws Exception {
    final IDatabaseTester databaseTester = new JdbcDatabaseTester(JDBC_DRIVER, JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    databaseTester.setSetUpOperation(DatabaseOperation.CLEAN_INSERT);
    databaseTester.setDataSet(dataSet);
    databaseTester.onSetup();
}
```

最初、こうしたらいいんじゃない？と思って適当にセットしたが反映されなかった。onSetup()時に同じWARNが出る

```java
void cleanlyInsert(final IDataSet dataSet) throws Exception {
    final IDatabaseTester databaseTester = new JdbcDatabaseTester(JDBC_DRIVER, JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    databaseTester.getConnection().getConfig().setProperty( config.setProperty(DatabaseConfig.PROPERTY_DATATYPE_FACTORY, new OracleDataTypeFactory());
    databaseTester.setSetUpOperation(DatabaseOperation.CLEAN_INSERT);
    databaseTester.setDataSet(dataSet);
    databaseTester.onSetup();
}
```

内部でconnectionを作るときにconfigをnewしているので、上記では反映されない。
こうするといい

```java
import org.dbunit.JdbcDatabaseTester;
import org.dbunit.database.DatabaseConfig;
import org.dbunit.database.IDatabaseConnection;
import org.dbunit.ext.h2.H2DataTypeFactory;

public class H2JdbcDatabaseTester extends JdbcDatabaseTester {
    public H2JdbcDatabaseTester(String driverClass, String connectionUrl, String username, String password) throws ClassNotFoundException {
        super(driverClass, connectionUrl, username, password);
    }

    @Override
    public IDatabaseConnection getConnection() throws Exception {
        IDatabaseConnection connection = super.getConnection();
        DatabaseConfig dbConfig = connection.getConfig();
        // DBアクセス時に出るWARNを抑制
        dbConfig.setProperty(DatabaseConfig.PROPERTY_DATATYPE_FACTORY, new H2DataTypeFactory());
        return connection;
    }
}


void cleanlyInsert(final IDataSet dataSet) throws Exception {
    final IDatabaseTester databaseTester = new H2JdbcDatabaseTester(JDBC_DRIVER, JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    databaseTester.setSetUpOperation(DatabaseOperation.CLEAN_INSERT);
    databaseTester.setDataSet(dataSet);
    databaseTester.onSetup();
}

```
