# Vue 3 / Nuxt / NestJS ベストプラクティス（公式優先）

このメモは、Vue 3 / Nuxt / NestJS でシステムを構成する際の基本方針を、できるだけ公式ドキュメントに寄せて整理したものです。

## 結論

Web アプリや公開サイトを新規に作るなら、まずは **Nuxt をフロントエンドの第一候補** にし、バックエンドは **NestJS** を組み合わせる構成が無難です。  
Vue 3 単体は、**純粋な SPA** や **埋め込み UI / 小さな管理画面** のように、Nuxt のルーティング・SSR・サーバー機能が不要な場面で選びます。

| 領域                     | 推奨                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| フロントエンド           | **Nuxt**（Web アプリの第一候補）                                     |
| Vue 3 単体を使う場面     | 純粋な SPA、社内管理画面、埋め込み UI、SSR/SSG が不要な小規模画面    |
| バックエンド             | **NestJS + feature modules**                                         |
| Nuxt のデータ取得        | 初期表示は `useFetch` / `useAsyncData`、イベント起点は `$fetch`      |
| 状態管理                 | local first -> `useState` / composables -> 必要になったら Pinia      |
| Nuxt の設定管理          | `runtimeConfig`                                                      |
| NestJS の設定管理        | `@nestjs/config`                                                     |
| 入力検証                 | NestJS の `ValidationPipe` + DTO class                               |
| 認証                     | NestJS 側の `AuthModule` + `@nestjs/jwt`                             |

---

## Vue 3

Vue 3 は Nuxt の土台でもあるため、**Nuxt を使う場合でも Vue 3 のコンポーネント設計原則はそのまま重要**です。

### 推奨構成

- **Composition API / `<script setup>`**
- 再利用ロジックは **composables**
- 状態管理は **local first**
- 依存ライブラリは **最小限**

### ベストプラクティス

1. **Composition API / `<script setup>` を基本にする**
   - 再利用しやすく、ロジックを composable に切り出しやすい。

2. **状態は local first**
   - まずは各コンポーネント内に状態を閉じ込める。
   - 複数コンポーネントで共有が必要になったら `useState` や Pinia を検討する。

3. **composable に stateful logic を集約する**
   - データ取得、UI ロジック、購読処理などの再利用に向く。
   - 命名は `useXxx` を基本にする。

4. **ルートや重い UI は分割ロードを前提にする**
   - Vue / Nuxt ともに code splitting を活かす構成が基本。

5. **信頼できないテンプレートは使わない**
   - ユーザー入力をテンプレート文字列として評価しない。
   - `v-html` は原則避ける。

6. **依存ライブラリは最小限にする**
   - bundle size と保守性を悪化させる追加を避ける。

### 補足

- Vue の Style Guide は公式だが、ページ上で **outdated** と明記されている。
- 実務判断は Style Guide だけでなく、Composables / State Management / Performance / Security の各ガイドも合わせて参照する。

---

## Nuxt

Nuxt は **Vue 3 ベースのフルスタックフレームワーク**です。  
公式は、**SSR、ファイルベースルーティング、auto-import、データ取得、TypeScript、Vite** などを組み込みで提供する前提で設計しています。

### 推奨構成

- 画面とルーティングは **Nuxt の規約ベース**
- 初期表示データは **`useFetch` / `useAsyncData`**
- 共有状態は **`useState` を基本**
- 設定は **`runtimeConfig`**
- 内部リンクは **`<NuxtLink>`**
- 描画方式は **universal rendering を基本にしつつ route rules で調整**

### ベストプラクティス

1. **新規 Web アプリでは Nuxt を第一候補にする**
   - Vue Router / Vite / SSR / データ取得を個別に組み立てるより、公式の統合前提に乗る方が安全。
   - SEO、初期表示、公開ページ、認証付き画面が混在する構成と相性がよい。

2. **Nuxt のディレクトリ規約を崩しすぎない**
   - `app/pages`, `app/layouts`, `app/components`, `app/composables`, `server/api` などの役割に沿って整理する。
   - 規約を活かした方が auto-import や型生成の恩恵を受けやすい。

3. **初期表示データは `useFetch` / `useAsyncData` を使う**
   - SSR 時の取得結果を payload に載せ、hydration 時の二重取得を避けやすい。
   - `setup` 内の初期データ取得を `$fetch` だけで済ませる設計は避ける。

4. **`$fetch` はイベント起点や明示的な API 呼び出しに使う**
   - フォーム送信、ボタンクリック後の更新、クライアント起点の操作に向く。
   - 初期描画と操作後更新で使い分ける。

5. **共有状態は `useState` を標準にし、肥大化したら Pinia を使う**
   - Nuxt 公式の `useState` は SSR フレンドリー。
   - `ref()` を `setup` 外で共有すると、サーバーリクエスト間で状態共有やメモリリークの原因になりうる。
   - 永続的で複雑な業務状態だけ Pinia に上げる。

6. **設定と秘密情報は `runtimeConfig` に寄せる**
   - サーバー専用値は `runtimeConfig` の private 領域に置く。
   - クライアントへ公開してよい値だけ `runtimeConfig.public` に置く。
   - secret を `public` 側や画面描画に流さない。

7. **描画方式は route rules でページ単位に最適化する**
   - 公開トップや記事は prerender / ISR / SWR を検討する。
   - 管理画面は必要に応じて CSR 寄りにできる。
   - 全ページを一律に SSR か SPA に固定するより柔軟に考える。

8. **内部ナビゲーションは `<NuxtLink>` を使う**
   - prefetch など Nuxt 側の最適化を活かせる。

9. **重いコンポーネントは lazy load / lazy hydration を検討する**
   - 初期表示に不要な UI を遅延ロードして、JavaScript と hydration コストを抑える。

10. **Nuxt の server/api はフロント寄りの責務に留める**
    - BFF、軽い集約、cookie / header 中継には向く。
    - 独立した業務 API やドメインロジックの中心は、別の NestJS バックエンドに寄せた方が保守しやすい。

### Nuxt でまず採用してよいもの

- `useFetch`
- `useAsyncData`
- `useState`
- `runtimeConfig`
- `<NuxtLink>`
- route rules

---

## NestJS

### 推奨構成

- 機能単位の **feature modules**
- モジュール境界を明確にした service / controller / dto 構成
- 設定は `@nestjs/config`
- 入力検証は DTO + `ValidationPipe`
- 認証は `AuthModule` に集約

### ベストプラクティス

1. **feature module 単位で責務を分ける**
   - `users`, `auth`, `orders` のように機能で分割する。
   - Nest 公式でも module はアプリ整理の中核として強く推奨されている。

2. **provider は module に閉じ込め、必要なものだけ export する**
   - module の public interface を意識する。
   - 暗黙の共有より、`imports` / `exports` を明示した方が保守しやすい。

3. **global module を多用しない**
   - 例外は設定、共通接続、最小限の共通機能に留める。

4. **設定値は環境変数中心で管理する**
   - `@nestjs/config` を使い、必要に応じて namespaced config や custom config file を使う。

5. **DTO class と global ValidationPipe を標準化する**
   - 本番向けには少なくとも以下を検討する。
     - `transform: true`
     - `whitelist: true`
     - `forbidNonWhitelisted: true`

6. **interface ではなく DTO class を使う**
   - ValidationPipe は runtime metadata の都合上 class ベースが前提。

7. **認証は AuthModule に閉じ込める**
   - ユーザー取得は `UsersModule`
   - 認証処理は `AuthService`
   - JWT 発行は `@nestjs/jwt`

8. **パスワードは平文で保存しない**
   - `bcrypt` などで salted hash を使う。

9. **JWT secret はソースコードに置かない**
   - 環境変数、秘密情報ストア、設定サービスなどで管理する。

10. **設定値は起動時に失敗させる設計がよい**
    - Config factory 内で型変換や検証を行い、不正値は早期にエラーにする。

### NestJS でまず採用してよいもの

- `@nestjs/config`
- `class-validator`
- `class-transformer`
- `@nestjs/jwt`

---

## Nuxt + NestJS の役割分担

### Nuxt 側

- UI 描画
- レイアウト
- ルーティング
- SSR / SSG / route rules
- 初期表示データ取得
- フロント向け BFF

### NestJS 側

- 認証
- 認可
- 入力検証
- 業務ルール
- DB アクセス
- 外部サービス連携
- 秘密情報の取り扱い

### 基本原則

- セキュリティ判断と最終バリデーションは NestJS 側に置く
- Nuxt は UX と表示最適化を担う
- Nuxt の server/api を使っても、業務ルールの本体は NestJS 側に寄せる

---

## まず避けたいこと

### Vue 3 / Nuxt

- `v-html` の多用
- 共有状態を無秩序に直接変更する
- `ref()` を `setup` 外に置いてサーバー横断で共有する
- 初期表示データを `$fetch` だけで取得する
- secret を `runtimeConfig.public` に置く
- Nuxt の規約を崩しすぎて、独自流儀でルーティングや構成を再発明する

### NestJS

- global module の乱用
- DTO を使わず `any` や雑な `Record<string, any>` で受ける
- ValidationPipe を入れない
- secret をコードに直書きする
- password を平文で保持する

---

## 実務上の無難な初期テンプレート

### 公開サイト / 一般的な Web アプリ

- Nuxt
- universal rendering を基本
- `useFetch` / `useAsyncData`
- `useState` を基本に必要なら Pinia
- `runtimeConfig`
- NestJS API

### 管理画面 / 純粋な業務 SPA

- 第一候補は Nuxt
- SEO や SSR が不要なら route rules や `ssr: false` を検討
- Nuxt の恩恵が不要で本当に軽量な画面だけ Vue 3 + Vite を検討
- API / 認証 / 検証は NestJS

### NestJS

- `AppModule`
- `ConfigModule.forRoot({ isGlobal: true })`
- `UsersModule`
- `AuthModule`
- DTO + global `ValidationPipe`

---

## 公式参照

### Vue

- Style Guide  
  https://vuejs.org/style-guide/
- Composables  
  https://vuejs.org/guide/reusability/composables
- State Management  
  https://vuejs.org/guide/scaling-up/state-management.html
- Performance  
  https://vuejs.org/guide/best-practices/performance
- Security  
  https://vuejs.org/guide/best-practices/security

### Nuxt

- Introduction  
  https://nuxt.com/docs/4.x/getting-started/introduction
- Rendering  
  https://nuxt.com/docs/4.x/guide/concepts/rendering
- Data Fetching  
  https://nuxt.com/docs/4.x/getting-started/data-fetching
- State Management  
  https://nuxt.com/docs/4.x/getting-started/state-management
- Runtime Config  
  https://nuxt.com/docs/4.x/guide/going-further/runtime-config
- Performance  
  https://nuxt.com/docs/4.x/guide/best-practices/performance

### NestJS

- Modules  
  https://docs.nestjs.com/modules
- Configuration  
  https://docs.nestjs.com/techniques/configuration
- Validation  
  https://docs.nestjs.com/techniques/validation
- Authentication  
  https://docs.nestjs.com/security/authentication

---

## 参照情報の確認日時

このメモの主な参照元は **2026-04-19 JST 時点**で確認したものです。

### 補足

- Vue Style Guide は公式ページ自体に **outdated** と明記されている。
- Nuxt は Vue 3 の上位フレームワークとして捉え、Web アプリ全体の推奨は Nuxt を優先する。
- Vue 3 単体は、Nuxt の SSR / ルーティング / サーバー機能が不要な場面で選ぶ。
