# 入院馬管理アプリ（馬体管理）

競走馬の入院・往診管理を行うNext.jsアプリです。データは端末のブラウザ（localStorage）に保存されるため、サーバー側のデータベースは不要です。

## 主な機能

- 馬ごとの状態管理（往診中 / 経過観察 / 健康）と厩舎（4A / 4B）管理
- 往診・厩舎確認の履歴記録（処置内容・投薬・獣医師名など）
- 体温の記録と推移グラフ
- 血液検査の記録と項目ごとの推移グラフ（WBC・Fib・TPなどのプリセット付き、自由項目も追加可）
- 体重の記録と推移グラフ
- 給餌記録（給餌内容・分量・食欲）
- 画像検査待ち・手術依頼の管理、カレンダーでの日程確認
- **写真からの自動入力**：カルテ、血液検査票、体重計、体温計などを撮影すると、AI（Claude）が内容を読み取ってフォームに自動入力します（内容は保存前に確認・修正可能）

## セットアップ

```bash
npm install
```

写真からの自動入力機能を使う場合は、`.env.local` を作成してAPIキーを設定してください（`.env.local.example` を参照）。

```bash
cp .env.local.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

APIキーは [Anthropic Console](https://console.anthropic.com/) から取得できます。この機能を使わない場合は設定不要です（他の機能は通常通り動作します）。

## 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3001` を開いてください（`start.bat` からも起動できます）。

## Vercelへのデプロイ

1. このディレクトリをGitHubリポジトリにpushします。
2. [Vercel](https://vercel.com/) で「New Project」からリポジトリをインポートします（Next.jsは自動検出されます）。
3. 写真自動入力を使う場合は、Vercelのプロジェクト設定 → Environment Variables に `ANTHROPIC_API_KEY` を追加します。
4. デプロイを実行します。

データは各ブラウザのlocalStorageに保存されるため、複数端末間でデータは同期されません（同じ端末・同じブラウザでのみ保持されます）。
