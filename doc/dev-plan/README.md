# FERMS 開発計画

## 1. 文書の目的

本計画は、`demo02_ferms` を `sys` 配下で実装開始するための開発順序を整理する。  
`doc\spec\ferms-spec.md` と `doc\spec-auth\README.md` を前提に、MVP を段階的に動く状態へ持っていくためのフェーズ、成果物、依存関係を定義する。

## 2. 前提

- 実装対象は `E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys` 配下とする
- 現時点では `sys` 配下は未着手のため、最初に実行基盤を作る
- フロントエンドは **Nuxt + Vue 3 + TypeScript**
- バックエンドは **NestJS + TypeScript**
- データベースは **PostgreSQL**
- 認証は **tanoshimi.dev の portal 認証を引き継ぎ、FERMS 側でローカルセッションを発行する**
- デプロイは **Docker / docker compose** を前提とする

## 3. 参照文書

- `doc\init.md`
- `doc\policy.md`
- `doc\spec\ferms-spec.md`
- `doc\spec-auth\README.md`

## 4. 開発方針

- まずは **起動できる最小構成** を作る
- 次に **認証と共通基盤** を固める
- その後、**利用者向け予約導線** を先に縦に通す
- 管理画面は利用者導線の後に実装し、施設・設備・予約運用を閉じる
- 予約ルール、認証、入力検証などの重要制約はバックエンドで担保する
- 本番を見据え、ローカル開発と本番で大きく乖離しない構成にする

## 5. 推奨ディレクトリ方針

```text
sys/
  frontend/        Nuxt アプリ
  backend/         NestJS API
  db/              マイグレーション、初期 SQL、シード
  docker-compose.yml
  docker-compose.prod.yml
```

必要に応じて以下を追加する。

```text
sys/
  scripts/         開発補助スクリプト
  infra/           リバースプロキシや運用補助設定
```

## 6. 開発フェーズ

| Phase | 目的 | 主な成果物 | Doc |
| --- | --- | --- | --- |
| Phase 1 | 実行基盤を作る | Nuxt / NestJS / PostgreSQL / Docker の初期構成 | [phase1-foundation.md](./phase1-foundation.md) |
| Phase 2 | 認証と共通基盤を作る | portal handover 認証、ローカルセッション、共通レイアウト | [phase2-auth-and-common.md](./phase2-auth-and-common.md) |
| Phase 3 | 利用者向け予約導線を作る | 施設/設備一覧、空き確認、予約作成/一覧/キャンセル | [phase3-reservation-user-flow.md](./phase3-reservation-user-flow.md) |
| Phase 4 | 管理運用機能を作る | 施設管理、設備管理、予約管理、運用設定 | [phase4-admin-and-operations.md](./phase4-admin-and-operations.md) |
| Phase 5 | 仕上げとリリース準備 | シード、UI 調整、監視観点、デモ導線、本番設定 | [phase5-hardening-and-release.md](./phase5-hardening-and-release.md) |

## 7. MVP の範囲

### 7.1 MVP に含めるもの

- portal 認証引き継ぎ
- 施設一覧、設備一覧、詳細表示
- 空き状況確認
- 予約作成、予約一覧、予約キャンセル
- 管理者による施設・設備・予約管理
- 重複予約防止、無効施設・設備の予約禁止

### 7.2 MVP で後回しにするもの

- 決済
- 外部カレンダー連携
- 通知機能
- 高度な権限管理
- マルチテナント
- OAuth 2.0 複数プロバイダの本格対応

## 8. 初回着手順

1. `sys\frontend` に Nuxt アプリを作成する
2. `sys\backend` に NestJS アプリを作成する
3. PostgreSQL と接続設定を整える
4. docker compose で frontend / backend / db を同時起動できるようにする
5. 認証 API と共通レイアウトを先に実装する
6. 利用者向け予約導線を最小機能で通す

## 9. 実装開始判断の目安

以下がそろえば、`sys` 配下の実装を開始してよい。

- 仕様書と認証仕様が確定している
- フロントエンド / バックエンド / DB の責務分離に合意できている
- 本番 URL とローカル開発 URL の方針が整理できている
- 予約ルールと認証引き継ぎ方式が実装可能な粒度まで落ちている
