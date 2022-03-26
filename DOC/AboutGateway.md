# ゲートウェイについて

## そもそもゲートウェイとは

>ゲートウェイ（Gateway）とは、コンピュータネットワークにおいて、通信プロトコルが異なるネットワーク同士がデータをやり取りする際、中継する役割を担うルータのような機能を備えた機器やそれに関するソフトウェアを意味します。([IoT用語辞典](https://www.keyence.co.jp/ss/general/iot-glossary/gateway.jsp))

つまり、**中継地点**ってことです。

今回はAPIの中継地点となるので、APIゲートウェイとなります。

## プロキシサーバとは

そのゲートウェイを担うのがプロキシサーバなんですが、そもそもプロキシサーバってなんでしょ。

>プロキシサーバーとは、インターネットへのアクセスを代理で行うサーバーのことです。 通常はパソコンやモバイル端末のブラウザを経由して直接Webサイトへアクセスし、サーバーがデータをブラウザに返すことで画面にWebサイトが表示されます([Norton](https://jp.norton.com/internetsecurity-etc-proxy-server.html))

つまり、通常APIサーバに直接アクセスするのをプロキシサーバが担うってことです。多分。

## プロキシサーバの構築

今回はnode.jsを用いました。expressで構築できるのか謎だったので[参考元リポジトリ](https://github.com/s-moteki/oauth2-with-keycloak)を参考にしました。

ちょっと苦労したのが、`http.createServer`内のこの条件式。

```javascript
if (req.url && req.url.startsWith('/api/private') && req.method !== 'OPTIONS'
)
```

特に`req.method !== 'OPTIONS'`の部分。実はこれがない場合、
```
Access to XMLHttpRequest at 'http://localhost:8080/owner' from origin 'http://localhost:3030' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

というエラーが発生します。なんかよくわからん英語が出てきて失神しそうですが冷静にみてみましょう。

一番最後の「It does not have HTTP ok status.」ぐらいなら私でも読めそうです。これ、要は「okステータス持ってないよね」って言ってると思うんですが、つまりどういうことなんでしょうか。

そこでめちゃくちゃ役に立ったのが「[CORS（preflight request）にハマったけど解決した話(qiita)](https://qiita.com/laughingman/items/4ff20268fa34dc9e1be3)」という記事。

この記事でも出てくる下の画像。

![](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS/preflight_correct.png)

まずクライアントからサーバへ[OPTIONS](https://developer.mozilla.org/ja/docs/Web/HTTP/Methods/OPTIONS)というメソッドが送られます。

そこでサーバからレスポンスがあり、初めてPOSTがサーバへ送られるわけですが。

実は「It does not have HTTP ok status.」って、一番最初のOPTIONSのことを言ってたんですよね。

Wiresharkなりで通信内容を見てみるとわかるんですが、OPTIONSとGET、2回リクエストを行ってるんです。OPTINOSの段階ではトークンは存在しないですから、トークンが正しくないという判定になります。そうすると401(okじゃないステータス)を投げるように設定してあるので、クライアントは「あれ、OPTINOSで401投げられてんじゃん」ってなるわけです。

じゃあどうすればいいかというと、OPTINOSの時はそのままスルーすればいいんです。そのための`req.method !== 'OPTIONS'`です。上記qiitaの記事ではOPTINOSの時はokステータスを投げるようにしてますが、今回は投げることもせずに流してます。

### プリフライトリクエストとは

さてここで謎の用語が出てきました。**プリフライトリクエスト**とはなんでしょうか。

これは**単純リクエスト**とは対比されるリクエストです。

単純リクエストとはその名の通り、普通に外部のドメインのコンテンツをリクエストすることです。この「普通」は「[単純リクエスト](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS#%E5%8D%98%E7%B4%94%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88)」に書かれています。

その「普通」を一つでも破ったリクエストがプリフライトリクエストというわけですね。

### axiosでのAuthorization付与

フロントサイドからプロキシサーバへリクエストを送る際のヘッダに値を付与できるんですが、このヘッダにAuthorizationを付けるとプリフライトリクエストとなるわけです。

確かに、[プリフライトリクエスト](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS#preflighted_requests)の説明に

>サイト間リクエストがユーザーデータに影響を与える可能性があるような場合に、このようにプリフライトを行います。

とありますし、プリフライトリクエストとなるのはなんら不思議ではないですね。

## axiosのHostヘッダ

[参考元リポジトリ](https://github.com/m0k1moki/oauth2-vue-test)にもあるんですが、

```javascript
const res = await axios.post('http://keycloak:8080/auth/realms/testrealm/protocol/openid-connect/token/introspect', params,{headers:{Host:'localhost:18080'}})
```

の`{Host:'localhost:18080'}`がちょっと気になるんです。なんでわざわざheaderに追加するのかなって。

Hostに関しては[Mozilla](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Host)の方で解説してますが、多分keycloak:8080をリクエスト先として送信されないようにするためですかね。うーん、これはちょっと謎。
