# Phase 2 実装結果

## 概要

`doc\dev-plan\phase2-auth-and-common.md` に基づき、portal handover と FERMS ローカルセッションを前提にした認証基盤、および共通レイアウト / dashboard 骨組みを実装しました。

## 実装内容

### 1. backend 認証基盤

- `AuthModule` に `AuthController` / `AuthService` / `SessionStore` / `SessionAuthGuard` を追加
- `MockAuthProvider` と `PortalAuthProvider` を `AUTH_MODE` で切り替え可能にした
- `portal_token` 検証、JWKS 取得、issuer / exp / 必須 claim 検証、互換 fallback 構造を追加
- `GET /api/auth/handover`
- `GET /api/auth/me`
- `GET /api/auth/logout`
- `POST /api/auth/logout`
- `returnTo` の同一 origin 制限と safe redirect を追加
- `demo02_ferms_session` Cookie の発行 / 失効を追加

### 2. frontend 共通基盤

- `useAuthSession` composable を追加
- frontend server route `server/api/auth/me.get.ts` で backend 認証状態をプロキシ
- `AuthStartPanel` と `AuthSummaryCard` を追加
- 共通ヘッダーで Home / Dashboard / Backend / Login / Logout を切り替え表示
- `/dashboard` を認証前提の共通ページ骨組みとして追加
- `/` を auth-aware な入口ページへ更新

### 3. 開発設定

- `sys\.env.example` に auth 関連設定を追加
- `sys\docker-compose.yml` に local mock 認証用の環境変数を追加
- local 既定値は `AUTH_MODE=mock`、`SESSION_COOKIE_SECURE=false` とした

### 4. テスト

- backend unit test
  - `mock-auth.provider.spec.ts`
  - `portal-auth.provider.spec.ts`
  - `auth.service.spec.ts`
  - `auth.guard.spec.ts`
- backend e2e test に handover -> me の導線を追加
- started-service smoke test を拡張し、以下を確認可能にした
  - 未認証 landing page
  - handover による session Cookie 発行
  - `/api/auth/me` の認証済みレスポンス
  - 認証済み `/dashboard` 表示

## 主要ファイル

| ファイル | 用途 |
| --- | --- |
| `sys\backend\src\auth\auth.controller.ts` | 認証 API |
| `sys\backend\src\auth\auth.service.ts` | handover / session / redirect 制御 |
| `sys\backend\src\auth\portal-auth.provider.ts` | portal token 検証 |
| `sys\frontend\app\composables\useAuthSession.ts` | frontend 認証状態取得 |
| `sys\frontend\app\pages\dashboard.vue` | 認証前提ページ骨組み |
| `sys\frontend\server\api\auth\me.get.ts` | backend `/api/auth/me` プロキシ |
| `sys\scripts\smoke.test.mjs` | started-service auth smoke test |

## 実行確認コマンド

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
docker compose up --build -d
npm run test:smoke
```

## 補足

- local 開発では `mock` モードで handover 導線を確認できる
- `portal` モード時は `PORTAL_*` 設定を与えることで demo01 と同じ handover 方式へ切り替えられる
- Phase 3 ではこの認証済み shell を前提に、施設 / 設備 / 予約導線を積み上げる
