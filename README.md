# demo02_ferms

施設・設備予約管理システム（FERMS）のデモプロジェクトです。  
利用者による予約と、管理者による施設・設備・予約運用を扱う Web アプリを想定しています。

## 概要

FERMS は、施設や設備の空き状況確認、予約作成、予約確認、予約キャンセルを提供するシステムです。  
あわせて、管理者が施設・設備情報や予約状況を管理できる構成を目指します。

現在は `sys` 配下に Nuxt frontend、NestJS backend、PostgreSQL、docker compose を揃えた
MVP 実装があり、利用者導線、管理導線、認証引き継ぎ、デモ用シード、回帰確認までを
段階的に確認できる状態です。

## 技術方針

- フロントエンド: **Nuxt + Vue 3 + TypeScript**
- バックエンド: **NestJS + TypeScript**
- データベース: **PostgreSQL**
- 認証: **親ポータルの認証状態を引き継ぎ、アプリ側でローカルセッションを発行**
- 実行環境: **Docker を前提にローカル開発しやすい構成**

詳細な採用理由や設計方針は `doc\policy.md` を基準にしています。

## 認証方針

このプロジェクトは独自ログインを持たず、親ポータルの認証状態を引き継ぐ方式を採用します。  
考え方は `demo01_crm` と同じで、認証の入口はポータル、業務 API の保護は FERMS 側ローカルセッションで行う前提です。

開発時は次の 2 モードを想定しています。

- `AUTH_MODE=mock`: 画面開発や業務機能開発を進めるための開発用モード
- `AUTH_MODE=portal`: 親ポータル連携を確認するためのモード

## 想定する主機能

### 利用者向け

- 施設一覧表示
- 設備一覧表示
- 空き状況確認
- 予約作成
- 予約一覧 / 詳細確認
- 予約キャンセル

### 管理者向け

- 施設管理
- 設備管理
- 予約管理
- 利用可否や公開状態などの基本運用設定

## ディレクトリ構成

現時点の構成は以下です。

```text
demo02_ferms/
  doc/
    dev-plan/
    spec/
    spec-auth/
  sys/
```

現在の `sys` 配下は次のような構成です。

```text
sys/
  backend/         NestJS API
  db/              DB 補助ファイルとシード方針
  frontend/        Nuxt アプリ
  scripts/         smoke test などの補助スクリプト
  docker-compose.yml
  docker-compose.prod.yml
```

## ローカル開発

ローカル確認は `sys` 配下を起点に行います。

```powershell
Set-Location E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms\sys
docker compose up --build -d
npm run test:smoke
```

個別確認が必要な場合は backend / frontend 配下で build や test を実行します。

## ドキュメント

| ファイル | 内容 |
| --- | --- |
| `doc\init.md` | プロジェクトの起点メモ |
| `doc\policy.md` | 技術方針、ベストプラクティス |
| `doc\spec\ferms-spec.md` | FERMS の機能仕様、データモデル、API 方針 |
| `doc\spec-auth\README.md` | 認証引き継ぎ仕様 |
| `doc\dev-plan\README.md` | 全体の開発計画 |
| `doc\dev-plan\phase*.md` | フェーズ別実装計画 |

## 開発の進め方

基本は次の順序で進める想定です。

1. 実行基盤を作る
2. 認証と共通基盤を固める
3. 利用者向け予約導線を実装する
4. 管理運用機能を実装する
5. デモ用データと導線を整える

フェーズの詳細は `doc\dev-plan` 配下を参照してください。
各フェーズの実装結果は `doc\dev-plan\result` 配下に記録しています。

## MVP 範囲

MVP では以下を優先します。

- 認証引き継ぎ
- 施設 / 設備の閲覧
- 空き状況確認
- 予約作成 / 一覧 / キャンセル
- 管理者による施設 / 設備 / 予約管理

以下は後回しです。

- 決済
- 外部カレンダー連携
- 通知機能
- 高度な権限管理
- マルチテナント対応

## 補足

この README には、本番構成や本番環境固有の設定は記載していません。  
実装判断は `doc\spec` と `doc\dev-plan` を正本として進める想定です。
