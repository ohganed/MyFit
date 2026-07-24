# MyFit Personal PWA

個人用の筋トレ記録PWAです。

## 主な機能
- 種目登録
- 重量＋回数、自重、左右別の記録
- 前回記録の自動表示
- 休憩タイマー
- トレーニング経過時間
- 履歴、終了レポート
- JSONバックアップ／復元
- オフライン対応

## Macで起動する方法
このフォルダでターミナルを開き、次を実行します。

python3 -m http.server 8000

Macでは次を開きます。
http://localhost:8000

iPhoneから試すには、MacとiPhoneを同じWi-Fiに接続し、
MacのローカルIPアドレスを使って次のようにアクセスします。

http://MacのIPアドレス:8000

注意：
通常のHTTPでは、iPhone上でService Workerや「ホーム画面アプリ」としての挙動が制限される場合があります。
長期利用には、GitHub Pages、Cloudflare Pages、NetlifyなどのHTTPS配信を使ってください。

## データ保存
localStorageに保存します。
SafariのWebサイトデータを削除すると記録も消えるため、定期的に「履歴 → 書き出し」でバックアップしてください。
