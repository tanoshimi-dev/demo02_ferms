# Phase 2 - 認証と共通基盤

## Goal

portal 認証引き継ぎ、FERMS ローカルセッション、共通レイアウト、認証ガードを整備する。

## Scope

- `portal_token` の検証
- FERMS ローカルセッション発行
- `/api/auth/handover`, `/api/auth/me`, `/api/auth/logout`
- mock / portal 2 モード運用
- Nuxt 側の認証状態取得
- 共通ナビゲーション、ヘッダー、レイアウト

## Tasks

1. `AuthModule` を作成する
2. `PortalAuthProvider` と `MockAuthProvider` を切り替え可能にする
3. JWKS 取得、issuer 検証、`portal_token` 検証を実装する
4. handover 成功時に `demo02_ferms_session` を発行する
5. `returnTo` の検証と安全なリダイレクトを実装する
6. Nuxt 側で `/api/auth/me` を使う認証状態取得 composable を作る
7. 未認証時の handover 遷移と logout 遷移を組み込む
8. 共通レイアウトと認証前提ページ骨組みを作る

## Deliverables

- backend の認証関連 module / guard / service
- frontend の auth composable / route handling
- portal 連携用設定値
- 開発用 mock 認証設定

## Done

- portal ログイン済み状態から FERMS に入れる
- 未認証時に `tanoshimi.dev/login?returnTo=...` へ戻せる
- logout 時に portal logout までつながる
- 認証必須ページを未認証で開けない

## Notes

- `portal_token` は JavaScript から読まない
- 認証の最終判定は backend で行う
- demo01 と env 名や URL 形式を揃えて差分を減らす
