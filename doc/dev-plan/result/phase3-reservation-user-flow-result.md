# Phase 3 実装結果

## 概要

`doc\dev-plan\phase3-reservation-user-flow.md` に基づき、認証済み利用者が施設・設備を閲覧し、空き状況を確認して予約を作成・確認・キャンセルできる導線を `sys` 配下に実装しました。

## 実装内容

### 1. backend の利用者向け予約基盤

- `UsersModule`, `FacilitiesModule`, `EquipmentsModule`, `ReservationsModule` を Phase 3 向けに接続
- `users`, `facilities`, `equipments`, `reservations` の entity を追加
- `CatalogSeedService` により、ローカル起動時に既定の施設 / 設備データを投入
- `GET /api/facilities`
- `GET /api/facilities/:facilityId`
- `GET /api/equipments`
- `GET /api/equipments/:equipmentId`
- `GET /api/reservations/availability`
- `GET /api/reservations`
- `GET /api/reservations/:reservationId`
- `POST /api/reservations`
- `PATCH /api/reservations/:reservationId/cancel`
- `SessionAuthGuard` を施設 / 設備 / 予約 API に適用

### 2. backend の予約ルール実装

- 開始日時 < 終了日時の検証を backend で実装
- 無効施設 / 無効設備の予約拒否を backend で実装
- 同一時間帯の重複予約拒否を backend で実装
- キャンセル済み予約を空き枠へ戻す挙動を実装
- 予約一覧 / 詳細 / キャンセルをログインユーザー単位で制御

### 3. frontend の利用者導線

- `/facilities` 施設一覧画面を追加
- `/facilities/[facilityId]` 施設詳細 + 空き確認 + 予約フォームを追加
- `/equipments` 設備一覧画面を追加
- `/equipments/[equipmentId]` 設備詳細画面を追加
- `/reservations` 自分の予約一覧画面を追加
- `/reservations/[reservationId]` 予約詳細画面を追加
- 主要画面は `useAuthSession({ required: true })` で認証前提に統一
- Nuxt server route で backend の facilities / equipments / reservations API を中継
- 共通ヘッダーから Facilities / Equipments / Reservations へ遷移可能に更新

### 4. テストと疎通確認

- backend unit test
  - `reservations.service.spec.ts`
  - 既存 auth / health / app 系 spec の回帰確認
- frontend build
- backend build
- started-service smoke test を拡張し、以下を確認可能にした
  - 施設一覧取得
  - 施設詳細から設備取得
  - 空き確認
  - 予約作成
  - 重複予約拒否
  - 予約一覧 / 詳細確認
  - 予約キャンセル
  - キャンセル後の空き再利用

## 主要ファイル

| ファイル | 用途 |
| --- | --- |
| `sys\backend\src\facilities\facilities.controller.ts` | 施設一覧 / 詳細 API |
| `sys\backend\src\equipments\equipments.controller.ts` | 設備一覧 / 詳細 API |
| `sys\backend\src\reservations\reservations.service.ts` | 予約可否判定、重複予約防止、作成 / 一覧 / 取消 |
| `sys\backend\src\reservations\reservation.entity.ts` | reservations テーブル定義 |
| `sys\backend\src\facilities\catalog-seed.service.ts` | 初期施設 / 設備シード |
| `sys\frontend\app\pages\facilities.vue` | 施設一覧画面 |
| `sys\frontend\app\pages\facilities\[facilityId].vue` | 施設詳細、空き確認、予約作成 |
| `sys\frontend\app\pages\reservations.vue` | 自分の予約一覧 |
| `sys\frontend\server\api\reservations.post.ts` | backend 予約 API 中継 |
| `sys\scripts\smoke.test.mjs` | 起動中サービス向け予約シナリオ smoke test |

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

- `SessionAuthGuard` を利用する `FacilitiesModule` / `EquipmentsModule` / `ReservationsModule` に `AuthModule` import を追加し、feature module 単位で依存解決できるようにした
- Phase 3 テスト追加後に崩れた auth spec / TypeScript 型エラーを補正し、backend の build / test を維持した

## 補足

- 施設・設備・予約の最終的な可否判定は backend 側に寄せています
- Phase 4 では、この利用者導線を前提に管理者向けの施設 / 設備 / 予約運用を追加します
