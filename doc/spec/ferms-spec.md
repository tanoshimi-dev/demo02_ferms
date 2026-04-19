# FERMS 仕様書

## 1. 文書概要

本書は、Facility and Equipment Reservation Management System（FERMS）の仕様を定義する。
`doc\policy.md` の技術方針と `doc\init.md` のプロジェクト目的を前提に、FERMS の機能要件、非機能要件、システム構成、データ構造、API 方針を整理する。

## 2. システム目的

FERMS は、施設および設備の予約をオンラインで管理するシステムである。
一般利用者は空き状況を確認して予約を行い、管理者は施設・設備・予約状況を管理できる。

## 3. スコープ

### 3.1 対象機能

- 利用者認証
- 施設・設備の一覧表示
- 空き状況の確認
- 予約の作成、確認、キャンセル
- 管理者による施設・設備管理
- 管理者による予約管理
- 将来的な外部認証連携を見据えた OAuth 2.0 対応

### 3.2 対象外

- 決済機能
- 外部カレンダーとの双方向同期
- 請求・会計管理
- 複数組織向けマルチテナント機能

## 4. 想定ユーザー

| 区分 | 説明 |
| --- | --- |
| 利用者 | 施設・設備を検索し、予約・確認・キャンセルを行う |
| 管理者 | 施設・設備・予約状況・利用制限を管理する |

## 5. 業務要件

### 5.1 利用者向け要件

1. 利用者は親ポータルの認証状態を引き継いで利用できる。
2. 利用者は施設一覧と設備一覧を閲覧できる。
3. 利用者は施設・設備ごとの予約可能日時を確認できる。
4. 利用者は利用開始日時と終了日時を指定して予約できる。
5. 利用者は自分の予約一覧を確認できる。
6. 利用者は自分の予約をキャンセルできる。

### 5.2 管理者向け要件

1. 管理者は施設情報を登録・更新・無効化できる。
2. 管理者は設備情報を登録・更新・無効化できる。
3. 管理者は予約一覧を検索・確認できる。
4. 管理者は必要に応じて予約をキャンセルまたは状態変更できる。
5. 管理者は予約可能時間帯、利用上限、公開状態などの運用設定を管理できる。

## 6. 画面要件

### 6.1 利用者画面

- 施設一覧画面
- 設備一覧画面
- 施設・設備詳細画面
- 予約作成画面
- 予約一覧画面
- 予約詳細画面

### 6.2 管理画面

- 管理ダッシュボード
- 施設管理画面
- 設備管理画面
- 予約管理画面
- ユーザー管理画面（将来拡張を前提とした基本枠のみ）

## 7. 予約ルール

1. 同一施設または同一設備に対して重複する時間帯の予約は作成できない。
2. 予約作成時には開始日時が終了日時より前でなければならない。
3. 無効化された施設・設備には新規予約できない。
4. キャンセル済み予約は再利用可能な空き枠として扱う。
5. 予約の最終可否判定はサーバー側で行う。

## 8. システム構成

### 8.1 全体構成

| レイヤ | 採用技術 | 方針 |
| --- | --- | --- |
| フロントエンド | Nuxt + Vue 3 + TypeScript | Web アプリの第一候補として Nuxt を採用する |
| バックエンド | NestJS + TypeScript | feature module を基本とする |
| データベース | PostgreSQL | 業務データの永続化に使用する |
| 認証 | portal handover + ローカルセッション | 認証処理は NestJS 側に集約する |
| デプロイ | Docker | 環境差異を抑えた構成とする |

### 8.2 フロントエンド方針

- Nuxt の規約ベース構成を採用する。
- 画面初期表示のデータ取得は `useFetch` または `useAsyncData` を使う。
- イベント起点の API 呼び出しは `$fetch` を使う。
- 共有状態は `useState` を基本とし、複雑化した場合のみ Pinia を検討する。
- 公開してよい設定のみ `runtimeConfig.public` に配置する。
- 内部遷移は `<NuxtLink>` を使う。

### 8.3 バックエンド方針

- NestJS の feature module 単位で責務を分割する。
- DTO class と `ValidationPipe` を標準採用する。
- 認証は `AuthModule` に集約する。
- 業務ルールと最終バリデーションは NestJS 側に置く。
- 設定管理は `@nestjs/config` を使い、秘密情報は環境変数で扱う。

## 9. モジュール構成

### 9.1 Nuxt 想定構成

- `app/pages`: 画面定義
- `app/layouts`: 共通レイアウト
- `app/components`: UI コンポーネント
- `app/composables`: 再利用ロジック
- `server/api`: BFF 的な軽量 API または中継処理

### 9.2 NestJS 想定構成

- `AppModule`
- `ConfigModule`
- `AuthModule`
- `UsersModule`
- `FacilitiesModule`
- `EquipmentsModule`
- `ReservationsModule`

## 10. データモデル

### 10.1 users

| 項目 | 型 | 説明 |
| --- | --- | --- |
| id | uuid | ユーザー識別子 |
| email | varchar | ログイン用メールアドレス |
| password_hash | varchar | ハッシュ化済みパスワード |
| role | varchar | `user` または `admin` |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### 10.2 facilities

| 項目 | 型 | 説明 |
| --- | --- | --- |
| id | uuid | 施設識別子 |
| name | varchar | 施設名 |
| description | text | 説明 |
| location | varchar | 所在地または配置情報 |
| is_active | boolean | 利用可否 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### 10.3 equipments

| 項目 | 型 | 説明 |
| --- | --- | --- |
| id | uuid | 設備識別子 |
| facility_id | uuid | 関連施設 ID |
| name | varchar | 設備名 |
| description | text | 説明 |
| is_active | boolean | 利用可否 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### 10.4 reservations

| 項目 | 型 | 説明 |
| --- | --- | --- |
| id | uuid | 予約識別子 |
| user_id | uuid | 予約者 ID |
| facility_id | uuid | 対象施設 ID |
| equipment_id | uuid nullable | 対象設備 ID |
| start_at | timestamp | 利用開始日時 |
| end_at | timestamp | 利用終了日時 |
| status | varchar | `reserved` `cancelled` `completed` |
| note | text nullable | 備考 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

## 11. API 要件

### 11.1 認証 API

- `GET /auth/handover?returnTo=<URL>`
- `GET /auth/me`
- `GET /auth/logout?returnTo=<URL>`
- `POST /auth/logout`

### 11.2 施設 API

- `GET /facilities`
- `GET /facilities/:id`
- `POST /facilities`
- `PATCH /facilities/:id`

### 11.3 設備 API

- `GET /equipments`
- `GET /equipments/:id`
- `POST /equipments`
- `PATCH /equipments/:id`

### 11.4 予約 API

- `GET /reservations`
- `GET /reservations/:id`
- `POST /reservations`
- `PATCH /reservations/:id/cancel`

### 11.5 管理 API

- `GET /admin/facilities`
- `GET /admin/facilities/:id`
- `POST /admin/facilities`
- `PATCH /admin/facilities/:id`
- `GET /admin/equipments`
- `GET /admin/equipments/:id`
- `POST /admin/equipments`
- `PATCH /admin/equipments/:id`
- `GET /admin/reservations`
- `GET /admin/reservations/:id`
- `PATCH /admin/reservations/:id`

### 11.6 API 設計方針

- リクエスト入力は DTO class で定義する。
- `ValidationPipe` により型変換と入力検証を行う。
- 認可が必要な API は FERMS のローカルセッションと guard で保護する。
- 管理者専用 API は role ベースで制御する。

## 12. 認証・認可要件

1. `portal_token` はバックエンドだけが扱う。
2. 認証判定とローカルセッション発行はサーバー側で行う。
3. セキュリティ上重要な設定値はソースコードに保存しない。
4. 認証設定と認可設定は環境変数で管理する。
5. 管理者専用機能は一般利用者から分離し、バックエンドで最終制御する。

## 13. 非機能要件

### 13.1 セキュリティ

- `v-html` のような危険な描画は原則使用しない。
- サーバー側で入力検証と権限検証を必ず実施する。
- 秘密情報は `runtimeConfig.public` に載せない。

### 13.2 保守性

- Nuxt と NestJS の公式規約に沿った構成を優先する。
- feature module により責務分離を明確にする。
- フロント側ロジックは composables に集約する。

### 13.3 拡張性

- OAuth 2.0 の追加プロバイダを将来拡張可能とする。
- 設備を施設配下に持つ構成を基本としつつ、将来の独立管理にも対応しやすいモデルとする。
- BFF と業務 API を分離しやすい責務境界を維持する。

## 14. 運用・設定方針

- Nuxt の設定は `runtimeConfig` を使用する。
- NestJS の設定は `@nestjs/config` を使用する。
- 不正な設定値は起動時にエラーとする。
- Docker によりアプリケーションと依存ミドルウェアの実行環境を統一する。

## 15. 今後の設計詳細化ポイント

1. 予約可能時間帯の詳細ルール定義
2. 施設と設備の関係の厳密な制約設計
3. 管理者権限の粒度設計
4. OAuth 2.0 対応プロバイダの選定
5. 通知機能の要否整理

## 16. 採用方針の根拠

本仕様書の技術選定は以下の方針に基づく。

- Web アプリのフロントエンドは Nuxt を第一候補とする
- Vue 3 は Nuxt の基盤として Composition API と composables を重視する
- バックエンドは NestJS の feature module、DTO、ValidationPipe を標準とする
- 認証、認可、入力検証、業務ルール、秘密情報管理は NestJS 側に集約する

以上により、FERMS は公開ページと認証付き画面を両立しやすく、将来の機能追加にも対応しやすい構成とする。
