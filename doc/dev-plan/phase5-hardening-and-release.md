# Phase 5 - 仕上げとリリース準備

## Goal

デモ、検証、本番投入に向けて、データ、導線、設定、運用観点を仕上げる。

## Scope

- seed data
- UI / UX 調整
- エラーメッセージと空状態
- 本番設定
- デプロイ確認

## Tasks

1. デモ用 seed data を作成する
2. 利用者導線と管理者導線を通しで確認しやすい画面遷移に調整する
3. 空状態、保存完了、入力エラー表示を整える
4. 本番用 docker compose と環境変数を確定する
5. `demo02-ferms.tanoshimi.dev` / `api-demo02-ferms.tanoshimi.dev` 前提の設定を仕上げる
6. portal 連携前提の cookie / issuer / jwks 設定を最終確認する
7. リリース後に見るべきログ、障害切り分け観点を整理する

## Deliverables

- デモ用データ
- 本番設定値
- デプロイ手順メモ
- 最終 UI 調整

## Done

- 利用者が予約作成から確認まで迷わず進める
- 管理者が施設・設備・予約を運用できる
- portal 認証連携が本番設定で成立する
- デモで必要なデータと導線が安定して再現できる

## Notes

- 本番で `AUTH_MODE=mock` を絶対に有効化しない
- cookie domain, secure, issuer, jwks の差異は最優先で確認する
- 監視や通知は最小限でも、障害時に原因を追えるログ設計は残す
