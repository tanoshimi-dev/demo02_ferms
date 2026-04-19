# Phase 5 実装結果

## 概要

`doc\dev-plan\phase5-hardening-and-release.md` に基づき、FERMS の利用者導線と管理導線を
デモ・検証・本番投入前提で仕上げました。デモ用 catalog seed、UI/UX の空状態と
成功/失敗表示、本番向け compose / env 例、回帰確認の更新を行っています。

## 実装内容

### 1. デモ用 seed data の拡充

- backend の `CatalogSeedService` を拡張
- 空の DB 起動時に、複数の施設 / 設備サンプルを自動投入
- 有効施設 / 有効設備だけでなく、停止中施設 / 停止中設備も含めてデモ用データを用意
- 利用者予約、管理者運用、予約禁止ルール確認を同じ catalog で再現しやすくした

### 2. 利用者導線の UI / UX 調整

- トップページと dashboard の文言を Phase 2 の骨組み表現から、現在の予約デモ表現へ更新
- dashboard に施設数 / 予約導線のクイックアクセスを追加
- 施設一覧、設備一覧、予約一覧に空状態と取得失敗表示を追加
- 施設詳細で停止中施設 / 停止中設備を frontend 上でも分かるようにし、予約フォームを無効化
- 予約作成後は予約詳細で成功メッセージを表示
- 予約一覧でキャンセル成功 / 失敗を明示するようにした

### 3. 管理者導線の UI / UX 調整

- 管理ダッシュボードにデモ向けの辿り方を明記
- 管理施設 / 設備 / 予約画面に空状態と一覧取得失敗表示を追加
- 管理予約画面では更新失敗時にフィードバックが消えないよう補正
- 管理者が catalog の初期投入直後から状態確認しやすい構成にした

### 4. 本番設定とデプロイ前提の整理

- `sys\docker-compose.prod.yml` を本番前提の URL / auth / cookie 設定込みで更新
- production compose は `demo01_crm` と同じく Traefik external network / labels / internal expose 構成へ調整
- production compose の DB 初期化用に `db/migrations/001_create_ferms_core.sql` と `db/seeds/001_seed_catalog.sql` を追加
- frontend の backend 接続先は Nuxt private runtime override (`NUXT_BACKEND_API_BASE_URL`) でも指定し、production build 後の container でも内部 API URL を差し替えられるようにした
- backend / frontend / db に restart と healthcheck を追加
- backend は本番例で `AUTH_MODE=portal` とし、`DATABASE_SYNCHRONIZE=false` を既定化
- `sys\.env.production.example` を追加し、
  `demo02-ferms.tanoshimi.dev` / `api-demo02-ferms.tanoshimi.dev` 前提の値を整理
- `SESSION_COOKIE_DOMAIN=.tanoshimi.dev` と `SESSION_COOKIE_SECURE=true` を本番例に反映

### 5. ドキュメントと回帰確認

- `README.md` を現状の実装状態に合わせて更新
- `doc\spec\ferms-spec.md` の API 保護方針を、実装済みのローカルセッション guard に合わせて補正
- `sys\db\README.md` と `sys\db\seeds\README.md` に現在の catalog seed 方針を反映
- smoke test を更新し、トップ / dashboard 文言変更と予約作成後の確認表示を回帰対象に追加

## 主要ファイル

| ファイル | 用途 |
| --- | --- |
| `sys\backend\src\facilities\catalog-seed.service.ts` | デモ用 catalog seed |
| `sys\frontend\app\pages\index.vue` | デモ入口の導線調整 |
| `sys\frontend\app\pages\dashboard.vue` | 利用者 / 管理者導線の開始点 |
| `sys\frontend\app\pages\facilities\[facilityId].vue` | 予約作成 UX と停止中案内 |
| `sys\frontend\app\pages\reservations\index.vue` | 予約一覧の空状態とキャンセル結果表示 |
| `sys\frontend\app\pages\admin\*.vue` | 管理導線の空状態 / 失敗表示 |
| `sys\frontend\app\assets\css\main.css` | 空状態 / 状態表示の共通スタイル |
| `sys\docker-compose.prod.yml` | 本番向け compose 例 |
| `sys\.env.production.example` | 本番向け env 例 |
| `sys\scripts\smoke.test.mjs` | 主要導線の回帰確認 |

## デプロイ前の確認メモ

1. `sys\.env.production.example` を元に本番値を用意し、秘密値だけ差し替える
2. `AUTH_MODE=portal`、issuer、JWKS URL、cookie domain / secure を最優先で確認する
3. reverse proxy 配下で `demo02-ferms.tanoshimi.dev` と `api-demo02-ferms.tanoshimi.dev` に正しく流れることを確認する
4. 初回失敗で空の PostgreSQL volume が残った場合は volume を削除してから再作成し、init SQL を再実行させる
5. `GET /api/health` と frontend の `/api/health` が compose 上で疎通することを確認する

## リリース後に見るログ / 切り分け観点

- backend 起動ログ: runtime config 不備、portal 設定不備、seed 投入有無
- backend `/api/health`: API と DB の疎通状況
- auth handover 失敗時: issuer、JWKS、cookie domain、secure 属性、`returnTo` 制約
- 予約失敗時: inactive facility / equipment、重複予約、日時不正
- frontend 画面異常時: `/api/health` と backend public URL の設定差異

## 実行確認コマンド

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys\backend
npm run build
npm test
npm run test:e2e
```

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys\frontend
npm run build
```

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys
docker compose up --build -d
npm run test:smoke
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```
