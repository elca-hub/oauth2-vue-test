# vueについて

## 使用した技術

- vuex(未使用)
- vue router(history mode)

## パッケージ管理ツール
yarn

## 開発環境と本番環境との差異について

今回vueを用いているので、いちいち`yarn install`していると結構時間がかかるので、本番環境と開発環境とでサーバ起動の構成等々を変えました。

開発環境ではnginxを、本番環境ではnode.js(express)を用いています。

※開発環境を使用する際は`web-test`を、本番環境を使用する際は`web`をdockeer-composeで指定してください

## SPAの対応

今回は[history mode](https://v3.router.vuejs.org/ja/guide/essentials/history-mode.html)を使用しているため、サーバの設定を行う必要があります。

### なんでサーバの設定が必要なの？

例えば`localhost:8080/ado`へ直接アクセスした場合(アドレスバーに直接入力してアクセスするなど)、サーバは`adoフォルダ`を探します。しかしvueはビルドするとindex.htmlしか生成しません。つまり、adoフォルダは存在しないということになります。そうすると404になるわけです。

これを防ぐために、サーバ側で「どんなアクセスでも`localhost:8080/`にアクセスする」という設定をする必要があります

### nginxの設定

[Vue Routerのドキュメント](https://v3.router.vuejs.org/ja/guide/essentials/history-mode.html#nginx)を丸コピすればOKです

### expressの設定

今回はnode.jsのフレームワーク、expressを使用してサーバを構築しています。

公式のドキュメントをみると、ソースコード自体は公開されていませんが、[connect-history-api-fallback middleware](https://github.com/bripkens/connect-history-api-fallback)を利用してくださいとの旨が記載されています。

では、このミドルウェアはどんな役割をするのでしょうか。

なんかREADME.mdをみると

```javascript
var express = require('express');

var app = express();
app.use(history()); // var history = require('connect-history-api-fallback');

```

というめっちゃ簡単なコードで完結していますね。

ただしここで注意してほしいのが、上の例だと全てのリクエストが **/index.html** になります。

今回のリポジトリのdockerコンテナ内はざっと以下のようなフォルダ構造になってます。

<pre>
/
├── server.js
├── dist
│   └── index.html
other folder...
</pre>

つまり、そのまま使っちゃうとserver.jsと同じ階層のindex.htmlをリクエストすることになります。が、当然ないわけです。

そのため今回は、"/"のリクエストに対して`res.sendFile(path.join(__dirname, 'dist', 'index.html'))`をするようにしていますが、実はドキュメントをしっかり読むとあるんですよね。どこをリクエスト先とするかを設定できるオプションが。

多分[この部分](https://github.com/bripkens/connect-history-api-fallback#index)を適用すれば上のコードはいらないと思います。