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

## デプロイ

GitHub Pages または Cloudflare Pages では、ビルドコマンドに `npm run build`、公開ディレクトリに `dist` を指定してください。

社内ネットワークのドメインフィルタを考慮し、アプリ自体は静的ファイルとして配信できます。初回表示後の QR 生成はローカルブラウザだけで動作します。
