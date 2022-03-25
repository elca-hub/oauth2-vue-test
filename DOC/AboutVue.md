# vueについて

## 使用した技術

- vuex
- vue router(history mode)

## パッケージ管理ツール
yarn

## 開発環境と本番環境との差異について

今回vueを用いているので、いちいち`yarn install`していると結構時間がかかるので、本番環境と開発環境とでサーバ起動の構成等々を変えました。

開発環境ではnginxを、本番環境ではnode.js(express)を用いています。
