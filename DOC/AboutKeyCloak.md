# keycloakについて

[keycloak](https://www.keycloak.org/)

## keycloakとは

>Keycloak（キークローク）は、モダンなアプリケーションやサービスで使用することを目的に開発された、シングルサインオン、アイデンティティ管理、アクセス管理（英語版）の機能を提供するオープンソースソフトウェア製品である。([wikipedia](https://ja.wikipedia.org/wiki/Keycloak))

わ、わかんないっピ...

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

`-Dkeycloak.migration.file=${export file path}`は、出力結果のjsonファイルをどこに出力するかを指定します。このパスは**出力先に指定したコンテナ側のパス名と一致させてください**。

あとは魔法の言葉ということで。詳細は[Keycloakの設定をファイルから読み込む(qiita)](https://qiita.com/shibukawa/items/70a60622c5cc596d355b#%E6%96%B0%E3%81%97%E3%81%84realm%E3%82%92%E4%BD%9C%E6%88%90)を参照してください。

実行するとログがまた騒ぎ出しますが、静まり返ったら`Ctrl + C`で停止します。

### 設定ファイルのインポート

ローカル側でjsonファイルが生成されたのを確認したら、docker-composeに以下の環境変数を追加します。

```yml:docker-compose.yml
keycloak:
  environment:
    KEYCLOAK_IMPORT: /tmp/testrealm.json
```

これで無事反映されます。

## appのclientに関する注意

ユーザのログイン等に用いるclientの設定について注意を。

[KEYCLOAK: Client secret not provided in request(stack overflow)](https://stackoverflow.com/questions/62298549/keycloak-client-secret-not-provided-in-request)でも出ていますが、実はkeycloakのドキュメント内には

>One important thing to note about using client-side applications is that the client has to be a public client as there is no secure way to store client credentials in a client-side application.([https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter))

と書かれているようです。翻訳すると

「クライアントサイドのアプリを使う際の重要点として、クライアントサイドのアプリにクライアントの認証情報を安全に保存する方法がないため、パブリッククライアントにする必要があります。」

となります。通常clientのAccess Typeはcredentialにした方がいいのですが、どうもクライアントサイドになると無理っぽいのでpublicにしろってことらしいです

## gateway用のclientの作成

ユーザがログインし、トークンが生成されます。そのトークンを検証する専用のクライアントを作成します。

この際のAccess Typeはbearer-onlyにしてください。

## keycloakとvueの連携

[このドキュメント](https://www.keycloak.org/securing-apps/vue)を参考にしました。

ただ、ドキュメントに書いてある例はアプリ全体が認証を必要とするものです。今回は「あるURLは認証を必要とする」としたいので、ちょっとだけ工夫してみました。とは言っても、created()に記述しただけですが...

keycloakをinit()したあとは`keycloak.token`にトークンが付与されていますので、これを使っていきます。

## トークンの検証

トークンを検証するにはそれ専用のAPIを叩く必要があります。それが
```
http://keycloak:8080/auth/realms/testrealm/protocol/openid-connect/token/introspect
```

です。ここでめちゃくちゃ重要なことを言いますが、`keycloak:8080`は`serviceName:port`になります。なんでそうなるか説明して。

わ、わかんないっピ...

curlで叩く時には`localhost:18080`とする必要があります。

詳細は[AboutProxy](./AboutGateway.md)を参照してください。
