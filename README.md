# oauth2-vue-test

keycloakのoauth2を用いた認証機能を使用したvue、apiのテスト用リポジトリ

## 何をしたいのか

- 公開APIや公開ページには認証なしでアクセスできるが、非公開のAPIやページにはアカウント認証を必要としたい
- なんかそれっぽいいい感じのやつ使いたい

## 起動

```bash
docker-compose up keycloak web-test
# or
docker-compose up keycloak web
```

今回はvueアプリのdistフォルダもリポジトリに公開しているのでどちらのコマンドを打っても変わらないです。というか正直上のコマンドの方が良かったりします。

なんかkeycloakのログがめちゃくちゃ出ますが、

```
WFLYSRV0051: Admin console listening on http://127.0.0.1:9990
```

が出ればOKです。

## アクセス

[localhost:8080(ホーム)](localhost:8080)

[localhost:8080(パブリック)](localhost:8080/about)

[localhost:8080(プライベート)](localhost:8080/owner) 👈アカウントが必要

## アカウント

ユーザ名 : akamurasaki

メールアドレス : akamurasaki@example.com

パスワード : adonokyokuiiyone

<font color="gray" size="1">Adoの曲いいよね</font>

## ドキュメント

このリポジトリはテスト・勉強用のリポジトリなので、DOCフォルダ内に解説(というかアウトプットがてらの説明)があります

## お詫び

何回も言いますが、このリポジトリは勉強用ですのでベストプラクティスではありません

## 参考元
[s-moteki/oauth2-with-keycloak](https://github.com/s-moteki/oauth2-with-keycloak)
