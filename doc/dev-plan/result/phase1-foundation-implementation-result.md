# Phase 1 実装結果

## 概要

`doc\dev-plan\phase1-foundation.md` に基づき、`sys` 配下に Nuxt / NestJS / PostgreSQL / Docker の最小構成を実装し、ローカル起動・build・test まで確認できる状態にしました。

## 実装内容

### 1. frontend

- Nuxt 4 アプリを作成
- 共通レイアウトとトップ画面を追加
- backend health を取得する server route と composable を追加

### 2. backend

- NestJS アプリを作成
- `ConfigModule` と `TypeOrmModule` による PostgreSQL 接続を追加
- `/api` プレフィックスを設定
- `/api/health` を追加
- 将来の feature module の配置先として以下を追加
  - `AuthModule`
  - `UsersModule`
  - `FacilitiesModule`
  - `EquipmentsModule`
  - `ReservationsModule`

### 3. db / docker

- `db\migrations`
- `db\seeds`
- `.env.example`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- frontend / backend の Dockerfile
- backend healthcheck の起動判定を修正
- backend 起動に必要な `class-validator` / `class-transformer` を追加

### 4. テスト

- backend lint
- frontend build
- backend build
- backend unit test
- backend e2e test
- 起動中サービス向け smoke test: `sys\scripts\smoke.test.mjs`

## 主要ファイル

| ファイル | 用途 |
| --- | --- |
| `sys\frontend\app\pages\index.vue` | Foundation 画面 |
| `sys\frontend\server\api\health.get.ts` | backend health proxy |
| `sys\backend\src\health\health.controller.ts` | `/api/health` |
| `sys\backend\src\config\runtime.config.ts` | 環境変数読み込み |
| `sys\docker-compose.yml` | ローカル起動 |
| `sys\scripts\smoke.test.mjs` | 起動中サービス向け smoke test |

## ローカル確認に使うコマンド

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys
Copy-Item .env.example .env
docker compose up --build -d
```

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys\backend
npm run lint
npm run build
npm run test
npm run test:e2e
```

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys\frontend
npm run build
```

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys
npm run test:smoke
```

## 実装時に解消した起動課題

- PostgreSQL の既存 volume による認証ずれを解消するため、compose 環境を再作成
- backend healthcheck の shell 解釈誤りを修正し、`backend` / `frontend` の依存起動を安定化
- backend e2e テストに `app.close()` を追加し、open handle 警告を解消

## 補足

- smoke test は **frontend / backend / db を起動した状態** で実行する前提です
- Phase 2 以降で認証 handover とローカルセッションを追加します
- Phase 3 以降で施設 / 設備 / 予約のデータモデルと API を追加します
