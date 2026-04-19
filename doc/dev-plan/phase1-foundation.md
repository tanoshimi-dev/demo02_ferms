# Phase 1 - 実行基盤

## Goal

Nuxt / NestJS / PostgreSQL / Docker の最小構成を作り、FERMS を起動できる状態にする。

## Scope

- Nuxt プロジェクト初期化
- NestJS プロジェクト初期化
- PostgreSQL 接続設定
- `docker-compose.yml` の作成
- `docker-compose.prod.yml` の雛形作成
- 環境変数方針の整理

## Tasks

1. `sys\frontend` に Nuxt アプリを作成する
2. `sys\backend` に NestJS アプリを作成する
3. `sys\db` に migration / seed の配置先を作る
4. backend から PostgreSQL へ接続する
5. frontend / backend / db の起動を docker compose へまとめる
6. health check 用の最小 API を作る
7. Nuxt 側にトップ導線と仮レイアウトを作る

## Deliverables

- `sys\frontend`
- `sys\backend`
- `sys\db`
- `sys\docker-compose.yml`
- `sys\docker-compose.prod.yml`
- `.env.example` 相当の設定例

## Done

- frontend が単体起動できる
- backend が単体起動できる
- backend が DB 接続できる
- docker compose で 3 つを同時起動できる

## Notes

- Nuxt は規約ベース構成を崩しすぎない
- NestJS は feature module 前提で初期構成を作る
- migration 方式は NestJS 側の採用技術に合わせて早めに固定する
