# Zoom QR Generator

Zoom 会議情報から接続用 QR コードを生成する静的 Web アプリです。QR 生成はブラウザ内で完結し、実行時に外部 CDN や API へ依存しません。

## 使い方

```bash
npm install
npm run dev
```

ビルド済みファイルを確認する場合:

```bash
npm run build
npm run preview
```

## サーバーなしのオフライン利用

JavaScript、CSS、QR生成ライブラリを1つのHTMLへ埋め込んだオフライン版を生成できます。

```bash
npm run build:offline
```

生成される `offline/Zoom-QR-Generator.html` をダブルクリックしてブラウザで開いてください。ファイル単体で配布でき、QR生成時にWebサーバーやインターネット接続は不要です。

ブラウザが `file://` でのクリップボード操作を制限する場合、QR画像やURLのコピーボタンは使用できません。その場合もQR生成とPNG保存は利用できます。

## デプロイ

GitHub Pages または Cloudflare Pages では、ビルドコマンドに `npm run build`、公開ディレクトリに `dist` を指定してください。

社内ネットワークのドメインフィルタを考慮し、アプリ自体は静的ファイルとして配信できます。初回表示後の QR 生成はローカルブラウザだけで動作します。

### GitHub Pages

Private repository で GitHub Pages を使うには、アカウントまたは organization のプランが対応している必要があります。対応していない場合は public repository に変更するか、Cloudflare Pages などの静的ホスティングを使ってください。

### Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist --project-name qrcode-generate
```

Wrangler が未ログインの場合は、事前に `wrangler login` または `CLOUDFLARE_API_TOKEN` の設定が必要です。
