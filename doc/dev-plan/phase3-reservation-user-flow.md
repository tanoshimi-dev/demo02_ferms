# Phase 3 - 利用者向け予約導線

## Goal

利用者が施設・設備を閲覧し、空き状況を確認して予約を作成・確認・キャンセルできる状態にする。

## Scope

- 施設一覧 / 詳細
- 設備一覧 / 詳細
- 空き状況 API
- 予約作成 API
- 予約一覧 / 詳細
- 予約キャンセル

## Tasks

1. `UsersModule`, `FacilitiesModule`, `EquipmentsModule`, `ReservationsModule` を整理する
2. `users`, `facilities`, `equipments`, `reservations` のテーブルを作る
3. 施設一覧・詳細 API を実装する
4. 設備一覧・詳細 API を実装する
5. 空き枠判定ロジックを実装する
6. 重複予約防止を backend 側で実装する
7. 予約作成 API とキャンセル API を実装する
8. Nuxt 側で一覧、詳細、予約フォーム、予約一覧画面を作る

## Deliverables

- 基本データモデル
- 利用者向け API 一式
- 利用者向け主要画面
- 空き状況と予約ルールの backend 実装

## Done

- 施設と設備を一覧表示できる
- 対象日時の予約可否を確認できる
- 予約作成後に自分の予約一覧で確認できる
- 重複予約と無効対象の予約が拒否される
- 予約キャンセル後に空き枠へ戻る

## Notes

- 初期表示データ取得は `useFetch` / `useAsyncData` を基本とする
- 更新系操作は `$fetch` を使う
- 予約可否判定は必ず backend で実施する
