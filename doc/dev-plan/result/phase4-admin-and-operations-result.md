# Phase 4 実装結果

## 概要

`doc\dev-plan\phase4-admin-and-operations.md` に基づき、管理者ロールを持つユーザー向けに施設 / 設備 / 予約の管理 API と管理画面を実装し、利用者導線との整合を保ったまま運用操作できる状態にしました。

## 実装内容

### 1. backend の管理者認可

- `AdminAuthGuard` を追加
- 管理 API は backend 側で `admin` ロールを必須化
- 既存の `SessionAuthGuard` と同じローカルセッション前提で管理 API を保護
- portal / mock の `role` claim を管理者認可に利用する構成へ接続

### 2. backend の管理 API

- `GET /api/admin/facilities`
- `GET /api/admin/facilities/:facilityId`
- `POST /api/admin/facilities`
- `PATCH /api/admin/facilities/:facilityId`
- `GET /api/admin/equipments`
- `GET /api/admin/equipments/:equipmentId`
- `POST /api/admin/equipments`
- `PATCH /api/admin/equipments/:equipmentId`
- `GET /api/admin/reservations`
- `GET /api/admin/reservations/:reservationId`
- `PATCH /api/admin/reservations/:reservationId`
- 施設 / 設備の `isActive` 切り替えを管理 API から変更可能にした
- 予約一覧は `facilityId` / `equipmentId` / `userId` / `status` で検索可能にした
- 予約状態は `reserved` / `cancelled` / `completed` に変更可能にした

### 3. frontend の管理画面

- `/admin` 管理運用ダッシュボードを追加
- `/admin/facilities` 施設管理画面を追加
- `/admin/equipments` 設備管理画面を追加
- `/admin/reservations` 予約管理画面を追加
- `useAdminSession` composable を追加し、非管理者を frontend 側でも 403 扱いに統一
- 共通ヘッダーと dashboard に admin ユーザー向け導線を追加
- Nuxt server route で admin facilities / equipments / reservations API を中継

### 4. 利用者導線との整合

- 管理画面で施設 / 設備を無効化すると、利用者向け API と画面にも停止状態が反映される
- 管理側の予約状態変更は利用者の予約一覧 / 詳細と同じ reservation データへ反映される
- started-service smoke test で、利用者導線と管理導線が矛盾しないことを確認できるようにした

### 5. テストと疎通確認

- backend unit test
  - `admin.guard.spec.ts`
  - `facilities.service.spec.ts`
  - `equipments.service.spec.ts`
  - `reservations.service.spec.ts` の admin 操作ケース追加
- backend build
- frontend build
- docker compose で起動した frontend / backend / db に対する smoke test を拡張
  - admin dashboard 表示
  - admin facilities / reservations 画面表示
  - 管理者による施設作成
  - 管理者による設備作成
  - 管理者による予約検索
  - 管理者による予約状態変更
  - 施設 / 設備の無効化と利用者導線への反映

## 主要ファイル

| ファイル | 用途 |
| --- | --- |
| `sys\backend\src\auth\admin.guard.ts` | 管理者認可 guard |
| `sys\backend\src\facilities\admin-facilities.controller.ts` | 管理者向け施設 API |
| `sys\backend\src\equipments\admin-equipments.controller.ts` | 管理者向け設備 API |
| `sys\backend\src\reservations\admin-reservations.controller.ts` | 管理者向け予約 API |
| `sys\frontend\app\composables\useAdminSession.ts` | frontend 管理者セッション判定 |
| `sys\frontend\app\pages\admin.vue` | 管理運用ダッシュボード |
| `sys\frontend\app\pages\admin\facilities.vue` | 施設管理画面 |
| `sys\frontend\app\pages\admin\equipments.vue` | 設備管理画面 |
| `sys\frontend\app\pages\admin\reservations.vue` | 予約管理画面 |
| `sys\scripts\smoke.test.mjs` | 利用者導線 + 管理導線の smoke test |

## 実行確認コマンド

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys\backend
npm run build
npm run test
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

## 実装時に反映した補正

- 利用者一覧ページと詳細ページの route 競合を解消するため、`facilities` / `equipments` / `reservations` の一覧ページを `index.vue` 構成へ整理した
- smoke test は永続 DB を再利用しても衝突しづらい future window を使うように調整した
- frontend Docker の dev 表示は `localhost` ベースになるよう `--publicURL` 指定へ切り替えた

## 補足

- MVP の運用状態切り替えは `isActive` を基本の管理項目として扱っています
- 管理者用の独自ログイン画面は追加せず、portal handover + ローカルセッション方式を維持しています
