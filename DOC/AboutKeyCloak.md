# keycloakについて

## keycloakとは

>Keycloak（キークローク）は、モダンなアプリケーションやサービスで使用することを目的に開発された、シングルサインオン、アイデンティティ管理、アクセス管理（英語版）の機能を提供するオープンソースソフトウェア製品である。([wikipedia](https://ja.wikipedia.org/wiki/Keycloak))

わ、わからないっピ...

要は認証機能を提供する便利なソフトウェアってことですかね。

## 認証の仕組み

例えば「あるAPIは誰でも使えるけど、このAPI達は認められたユーザだけ使用できる」なんてルールがある場合に使用されます。

今回は**OAuth2.0**というプロトコル(約束事)を用いています。この解説は[一番分かりやすいOAuthの説明(qiita)](https://qiita.com/TakahikoKawasaki/items/e37caf50776e00e733be)を見ていただければ一発で分かります。

そして上記記事で出てくる**認可サーバ**をkeycloakが担うということです。

## keycloakの設定の保存

keycloakの設定(ユーザの情報など)は、dockerで起動している場合リセットされます。つまり、開発環境では存在していたユーザが本番環境ではいなくなっているということです。

通常ならそれでもいいんですが、今回は既に生成されているユーザを用いているのでリセットされるのは困るわけです。

そこで、keycloakの設定を外部ファイルで出力し、keycloakの起動時にその外部ファイルをインポートします。

### 設定ファイルの出力先指定

設定ファイルはdockerコンテナ内で生成されます。つまり、ローカルには反映されないということです。

これを反映させるために、docker-composeに以下を記述します。

```yml:docker-compose.yml
keycloak:
  volumes:
    - ./keycloak/export/testrealm.json:/tmp/testrealm.json
```

### 設定ファイルの出力

まずはkeycloakを立ち上げます。

```bash
$ docker-compose up keycloak
```

ログが静まり返ったら、以下のコマンドを実行します。

```bash
$ docker exec -it oauth2-vue-test_keycloak_1 /opt/jboss/keycloak/bin/standalone.sh   -Djboss.socket.binding.port-offset=100   -Dkeycloak.migration.action=export   -Dkeycloak.migration.provider=singleFile  -Dkeycloak.migration.realmName=testrealm  -Dkeycloak.migration.usersExportStrategy=REALM_FILE   -Dkeycloak.migration.file=/tmp/testrealm.json
```

一気に変なコマンドが出てきて気絶しそうですが、ゆっくりと見てみましょう。

まず`docker exec -it ${container name} ${path}`は、dockerコンテナ内のシェルを実行します。この時、`${container name}`は`docker ps`で確認できます。

そして`-Dkeycloak.migration.realmName=${realm name}`は、出力したいrealmを指定します。

`-Dkeycloak.migration.file=${export file path}`は、出力結果のjsonファイルをどこに出力するかを指定します。

あとは魔法の言葉ということで。詳細は[Keycloakの設定をファイルから読み込む](https://qiita.com/shibukawa/items/70a60622c5cc596d355b#%E6%96%B0%E3%81%97%E3%81%84realm%E3%82%92%E4%BD%9C%E6%88%90)を参照してください。

実行するとログがまた騒ぎ出しますが、静まり返ったら`Ctrl + C`で停止します。
