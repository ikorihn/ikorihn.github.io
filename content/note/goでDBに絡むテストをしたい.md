---
title: goでDBに絡むテストをしたい
date: 2021-11-28T22:29:00+09:00
lastmod: 2021-11-28T22:29:00+09:00
tags:
- Go
---

\#Go

[GolangでDBアクセスがあるユニットテストのやり方を考える - Qiita](https://qiita.com/seya/items/582c2bdcca4ad50b03b7)

* SQLが実行される箇所をmockする(実際にDBに接続してSQLの結果を得る必要がない場合)
  
  * sqlmock を使う
* 実際のDBとテストデータを用意してSQLも実際に実行する

* テスト用DBの用意
  
  * <https://github.com/DATA-DOG/go-txdb> でテストケースごとに独立したトランザクション内でテストデータを用意・Rollbackを行う
    * <https://zenn.dev/rinchsan/articles/83cf6f3b5d70c4d9b5d4>
    * mysql だとnested transactionが使えないからコミットしている場合、Savepointにかえるとかしないと、rollbackできなさそう…？
    * 毎回deleteする、でもよくない？
  * <https://github.com/go-testfixtures/testfixtures> でfixtureを用意する
  * <https://github.com/testcontainers/testcontainers-go> や <https://github.com/ory/dockertest> を利用する
    * <https://qiita.com/yasuflatland-lf/items/4f18b55c2a6492d0c462>
    * Makefileでdocker-compose up してもいいけど、テストコードで書いておくとSkipも可
* CIではスキップしたい

````go
func skipCI(t *testing.T) {
  if os.Getenv("CI") != "" {
    t.Skip("Skipping testing in CI environment")
  }
}

func TestNewFeature(t *testing.T) {
  skipCI(t)
}
````

あるいはshortではスキップにする `go test -short`

````go
if testing.Short() {
  t.Skip("skipping testing in short mode")
}
````

### dockertestとfixtureを使ったテスト

dockertest を使ってコンテナを起動し、testfixtures でテストデータを流し込む

````go
package db_test

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/ory/dockertest/v3"
)

var (
	pool     *dockertest.Pool
	resource *dockertest.Resource
	db       *sql.DB
	fixtures *testfixtures.Loader
)

func prepareTestDatabase() error {
	var err error

	pool, err = dockertest.NewPool("")
	// コンテナの起動に時間がかかるため
	pool.MaxWait = 2 * time.Minute
	if err != nil {
		return err
	}

	basepath, _ := os.Getwd()

	user := "user"
	// DB名に test が入っていないと、fixtureのload時にエラーになる (https://github.com/go-testfixtures/testfixtures#security-check)
	dbName := "test_db"

	// Dockerコンテナ起動時の細かいオプションを指定する
	runOptions := &dockertest.RunOptions{
		Repository: "mysql",
		Tag:        "5.7",
		Env: []string{
			fmt.Sprintf("MYSQL_DATABASE=%s", dbName),
			fmt.Sprintf("MYSQL_USER=%s", user),
			fmt.Sprintf("MYSQL_PASSWORD=%s", user),
			"MYSQL_ROOT_PASSWORD=secret",
			"TZ=Asia/Tokyo",
		},
		Mounts: []string{
			basepath + "/etc/01_create_table.sql:/docker-entrypoint-initdb.d/01_create_table.sql",
		},
		Cmd: []string{
			"mysqld",
			"--character-set-server=utf8",
			"--collation-server=utf8_unicode_ci",
		},
	}

	// imageをpullして起動する
	resource, err = pool.RunWithOptions(runOptions)
	if err != nil {
		return err
	}

	// コンテナが起動されたことを確認するためのコマンドを定義
	if err := pool.Retry(func() error {
		time.Sleep(10 * time.Second)
		err := connectDb(resource.GetPort("3306/tcp"))
		if err != nil {
			return err
		}
		return db.Ping()
	}); err != nil {
		return err
	}

	return nil
}

func connectDb(port string) error {
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?parseTime=true&loc=Asia%%2FTokyo",
		user,
		user,
		port,
		dbName,
	)
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	return nil
}

func prepareFixture() error {
	var err error
	// fixtureを設定
	fixtures, err = testfixtures.New(
		testfixtures.Database(db),
		testfixtures.Dialect("mysql"),
		testfixtures.Directory("testdata/fixtures"), // The directory containing the YAML files
	)
	if err != nil {
		return err
	}
	return nil
}

func loadFixture() {
	if err := fixtures.Load(); err != nil {
		log.Fatalf("Could not load fixture: %v", err)
	}
}

func clearDb() {
	var err error
	if _, err = db.Exec("DELETE FROM myroad_t"); err != nil {
		log.Fatalf("Could not delete: %v", err)
	}
	if _, err = db.Exec("DELETE FROM notification_info_t"); err != nil {
		log.Fatalf("Could not delete: %v", err)
	}
	if _, err = db.Exec("DELETE FROM routine_push_time_t"); err != nil {
		log.Fatalf("Could not delete: %v", err)
	}
	if _, err = db.Exec("DELETE FROM send_close_road_regulation_t"); err != nil {
		log.Fatalf("Could not delete: %v", err)
	}
	if _, err = db.Exec("DELETE FROM token_endpoint_arn_t"); err != nil {
		log.Fatalf("Could not delete: %v", err)
	}
}

// テスト時に共通で実行する処理で、DBの用意などを行う
func TestMain(m *testing.M) {
	if _, ci := os.LookupEnv("SHORT_TEST"); ci {
		fmt.Printf("short modeのためテストをskipします")
		return
	}

	// テストデータ準備 start
	var err error
	err = prepareTestDatabase()
	if err != nil {
		log.Fatal(err)
	}

	err = prepareFixture()
	if err != nil {
		log.Fatal(err)
	}
	clearDb()
	// テストデータ準備 end

	code := m.Run()

	// You can't defer this because os.Exit doesn't care for defer
	if err := pool.Purge(resource); err != nil {
		log.Fatalf("Could not purge resource: %s", err)
	}

	os.Exit(code)

}

func TestFindUser(t *testing.T) {
	gormDb, err := gorm.Open(mysql.New(mysql.Config{
		Conn: db,
	}))
	if err != nil {
		t.Fatalf("error gorm.Open: %v", err)
	}
	gormDb.Logger = gormDb.Logger.LogMode(logger.Info)

	type fields struct {
		nowFactory repository.NowFactory
	}
	type args struct {
		userIds []string
	}

	tests := []struct {
		name    string
		fields  fields
		args    args
		want    []mydata
		wantErr bool
	}{
        // テストケース
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			loadFixture()

			c := &Client{
				db:         gormDb,
				nowFactory: tt.fields.nowFactory,
			}
			got, err := c.FindUser(tt.args.userIds)

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.ElementsMatch(t, tt.want, got)

		})
	}
}
````

fixtures には `テーブル名.yaml` の規則でファイルを置く

`testdata/fixtures/user_t.yaml`

````yaml
- user_id: "AAAAAAAxxxx"
  name: "foo"
  created_at: 1596715200
- user_id: "AAAAAAAyyyy"
  name: "bar"
  created_at: 1596815200
````

## docker-compose.ymlを使ってテストしたい

testcontainersではdocker-compose.ymlを使ってcomposeを実行できる

````yml:docker-compose.yml
version: '3.8'

services:
  db:
    image: mysql:5.7
    platform: linux/x86_64
    environment:
      MYSQL_DATABASE: test_db
      MYSQL_USER: user
      MYSQL_PASSWORD: user
      MYSQL_ROOT_PASSWORD: root
      TZ: "Asia/Tokyo"
    command: mysqld --character-set-server=utf8 --collation-server=utf8_unicode_ci --default-authentication-plugin=mysql_native_password
    volumes:
      - ./sql:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
````

````go
import (
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/docker/go-connections/nat"
	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

var (
	compose  *testcontainers.LocalDockerCompose
	db       *sql.DB
	fixtures *testfixtures.Loader
)

func prepareContainer(t *testing.T) error {
	pwd, _ := os.Getwd()
	composeFilePaths := []string{pwd + "/etc/db/docker-compose.yml"}
	identifier := "mydb"

	compose = testcontainers.NewLocalDockerCompose(composeFilePaths, identifier)

	user := "user"
	// DB名に test が入っていないと、fixtureのload時にエラーになる (https://github.com/go-testfixtures/testfixtures#security-check)
	dbName := "test_db"
	port := "3306"
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?charset=utf8&parseTime=true&loc=Asia%%2FTokyo",
		user,
		user,
		port,
		dbName,
	)
	dbURL := func(port nat.Port) string {
		return dsn
	}
	execError := compose.
		WaitForService("db", wait.ForSQL(nat.Port(port), "mysql", dbURL)).
		WithCommand([]string{"up", "-d"}).
		Invoke()
	err := execError.Error
	if err != nil {
		return fmt.Errorf("Could not run compose file: %v - %v", composeFilePaths, err)
	}

	db, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	return db.Ping()
}

func TestSample(t *testing.T) {
	// テストデータ準備 start
	if testing.Short() {
		t.Skip("skip integration test")
	}
	var err error
	err = prepareContainer(t)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := compose.Down().Error; err != nil {
			t.Fatalf("Could not purge resource: %v", err)
		}
	}()
	// テストデータ準備 end

	// ... test
}

````
