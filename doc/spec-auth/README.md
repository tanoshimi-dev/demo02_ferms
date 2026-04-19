# FERMS 認証仕様

## 1. 目的

`demo02_ferms` の認証は、`demo01_crm` と同じ仕組みを採用する。  
本番では `tanoshimi.dev` を認証ハブとし、ポータルで確立済みの認証状態を FERMS に引き継ぐ。

このため FERMS は**独自ログインを持たず**、親ポータルの認証状態を入口にして、FERMS 側のローカルセッションを発行する。

## 2. 前提システム

| システム | 役割 |
| --- | --- |
| `E:\dev\vs_code\products\tanoshimi.dev\sys\portal` | 認証ハブ。ログイン、SSO Cookie 発行、JWKS 公開を担う |
| `E:\dev\vs_code\products\tanoshimi.dev\sys\demo01_crm` | 先行実装。今回 FERMS が踏襲する認証方式の基準 |
| `E:\dev\vs_code\products\tanoshimi.dev\sys\demo02_ferms` | 今回の対象。demo01 と同じ handover 型認証を採用する |

## 3. 採用方針

FERMS は `demo01_crm` と同様に、以下の 2 段構えで認証を扱う。

1. 親ポータルが `.tanoshimi.dev` に対して発行した `portal_token` を FERMS バックエンドで検証する
2. 検証成功後、FERMS 独自のローカルセッション Cookie を発行して業務 API を保護する

つまり、**入口認証は portal、業務アクセス制御は FERMS ローカルセッション**とする。

## 4. portal 側の前提

既存実装と既存ドキュメントから、以下を前提とする。

- SSO Cookie 名は `portal_token`
- Cookie Domain は `.tanoshimi.dev`
- Cookie は `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- portal JWT の issuer は `https://tanoshimi.dev`
- JWKS は `https://api.tanoshimi.dev/v1/.well-known/jwks.json` から取得する
- portal のログイン画面は `https://tanoshimi.dev/login`
- portal のログアウト画面は `https://tanoshimi.dev/auth/logout`

補足として、`demo01_crm` は互換性のため `https://api.tanoshimi.dev` も許可 issuer に含めている。FERMS も同じ許容範囲を維持する。

## 5. FERMS の本番構成

本番の公開 URL は demo01 に合わせ、以下の命名を基本とする。

| 種別 | URL |
| --- | --- |
| フロントエンド | `https://demo02-ferms.tanoshimi.dev` |
| バックエンド | `https://api-demo02-ferms.tanoshimi.dev` |

## 6. 認証フロー

### 6.1 初回アクセス

1. ユーザーは `tanoshimi.dev` でログインする
2. portal が `.tanoshimi.dev` 向けに `portal_token` を設定する
3. ユーザーが `demo02-ferms.tanoshimi.dev` に遷移する
4. FERMS フロントエンドは `/api/auth/me` で認証状態を確認する
5. FERMS のローカルセッションが未作成で、かつ portal 認証もまだ引き継いでいない場合、`/api/auth/handover?returnTo=...` に遷移する
6. FERMS バックエンドが `portal_token` を検証する
7. 検証成功時、FERMS ローカルセッション Cookie を発行して `returnTo` に 302 リダイレクトする
8. 以後の業務 API は FERMS ローカルセッションで通過する

### 6.2 未認証時

1. `/api/auth/handover` 実行時に `portal_token` が無い、または無効
2. FERMS は `https://tanoshimi.dev/login?returnTo=<FERMS URL>` へリダイレクトする
3. portal ログイン後、元の FERMS URL に戻す

### 6.3 ログアウト時

1. FERMS はローカルセッションを破棄する
2. `GET /api/auth/logout?returnTo=...` の場合は `https://tanoshimi.dev/auth/logout?returnTo=<FERMS URL>` にリダイレクトする
3. portal が `portal_token` を削除し、全サブドメインで未認証状態に戻る

## 7. FERMS で実装する認証 API

demo01 と同じ責務で、以下を定義する。

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/auth/handover?returnTo=<URL>` | portal 認証を検証し、FERMS ローカルセッションを発行して戻す |
| `GET` | `/api/auth/me` | 現在ユーザー情報と認証状態を返す |
| `GET` | `/api/auth/logout?returnTo=<URL>` | ローカルセッションを破棄し、portal logout に接続する |
| `POST` | `/api/auth/logout` | SPA / 非画面遷移向けのログアウト API |

## 8. `/api/auth/me` のレスポンス

`demo01_crm` と同じ形を採用する。

### 8.1 認証済み

```json
{
  "data": {
    "authenticated": true,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Portal User",
      "role": "user"
    }
  }
}
```

### 8.2 未認証

- HTTP 401
- エラーコードは `unauthenticated`

## 9. トークン検証仕様

FERMS バックエンドは `portal_token` を直接読むが、フロントエンドは読まない。

### 9.1 検証項目

- JWT 署名が RS256 で正しいこと
- `kid` に対応する公開鍵が JWKS に存在すること
- `iss` が許可 issuer に含まれること
- `exp` が有効期限内であること
- `sub`, `email`, `name` が存在すること

### 9.2 利用クレーム

| クレーム | 用途 |
| --- | --- |
| `sub` | FERMS 内ユーザー識別子 |
| `email` | 表示およびアプリ内ユーザー同定 |
| `name` | 画面表示名 |
| `role` / `roles` | 将来の権限制御 |
| `iss` | 発行元検証 |
| `exp` | 有効期限検証 |

## 10. ローカルセッション仕様

FERMS は `demo01_crm` と同じく、portal 認証を毎回の入口確認に使いつつ、業務 API 保護にはローカルセッションを併用する。

### 10.1 Cookie

| 項目 | 値 |
| --- | --- |
| Cookie 名 | `demo02_ferms_session` |
| Domain | `.tanoshimi.dev` |
| Path | `/` |
| HttpOnly | `true` |
| Secure | `true` |
| SameSite | `Lax` |
| TTL | `12h` を初期値とする |

### 10.2 セッションの扱い

- handover 成功時に新規セッションを作成する
- `/api/auth/me` はまずローカルセッションを確認する
- ローカルセッションが無ければ、`AUTH_MODE=portal` 時のみ portal 認証を直接確認してもよい
- 業務 API はローカルセッション必須とする

## 11. `returnTo` 制約

open redirect を避けるため、FERMS は `returnTo` を厳格に制限する。

- FERMS フロントエンド自身の origin のみ許可する
- 相対パスはフロントエンド公開 URL 基準で解決する
- `http` / `https` 以外は拒否する
- 不正値は FERMS フロントエンドのトップへフォールバックする

portal 側の `/login` でも `tanoshimi.dev` および `*.tanoshimi.dev` を許可する実装があるため、FERMS 側もこれに合わせる。

## 12. 互換性要件

FERMS は demo01 と同じく、以下の互換性を持たせる。

- `PORTAL_COOKIE_NAME=portal_token`
- `PORTAL_COOKIE_NAMES` で複数 Cookie 名を受け取れること
- `PORTAL_ALLOWED_ISSUERS=https://tanoshimi.dev,https://api.tanoshimi.dev`
- `PORTAL_JWKS_URL=https://api.tanoshimi.dev/v1/.well-known/jwks.json`
- 必要時に portal session endpoint / userinfo endpoint へフォールバックできる構造にすること

これは portal 側の実装差分や移行過程を吸収し、demo01 と運用差異を作らないためである。

## 13. Nuxt / NestJS への適用方針

FERMS のアプリ構成は `doc\policy.md` に従い Nuxt + NestJS を前提とするが、認証責務は demo01 と同じにする。

### 13.1 Nuxt 側

- ページ初期表示時はサーバー経由で `/api/auth/me` を参照する
- 未認証時は `handoverUrl` へ遷移する
- `portal_token` を JavaScript から直接扱わない
- 認証状態管理は `useState` または composable に閉じ込める

### 13.2 NestJS 側

- `AuthModule` を用意する
- `PortalAuthProvider` と `MockAuthProvider` を切り替え可能にする
- `portal_token` 検証、JWKS 取得、issuer 検証、session 発行を backend 側に集約する
- `ValidationPipe` と Guard により、業務 API はローカルセッション必須にする

## 14. 開発時の認証運用

開発時も demo01 と同じく 2 モード運用を採用する。

| モード | 用途 |
| --- | --- |
| `AUTH_MODE=mock` | 日常的な画面開発、CRUD 開発 |
| `AUTH_MODE=portal` | 実際の portal 連携確認 |

### 14.1 mock モード

- 固定ユーザーを返す
- `/api/auth/me` のレスポンス形は portal モードと揃える
- 本番では絶対に無効化する

### 14.2 portal モード

- 疑似ドメインまたは本番相当ドメインで Cookie 共有を再現する
- portal のログイン、handover、logout までを通し確認する

## 15. 推奨設定値

```env
AUTH_MODE=portal
PORTAL_COOKIE_NAME=portal_token
PORTAL_COOKIE_NAMES=portal_token,authjs.session-token,__Secure-authjs.session-token,better-auth.session_token,__Secure-better-auth.session_token
PORTAL_ISSUER=https://tanoshimi.dev
PORTAL_ALLOWED_ISSUERS=https://tanoshimi.dev,https://api.tanoshimi.dev
PORTAL_JWKS_URL=https://api.tanoshimi.dev/v1/.well-known/jwks.json
PORTAL_LOGIN_URL=https://tanoshimi.dev/login
SESSION_COOKIE_NAME=demo02_ferms_session
SESSION_COOKIE_DOMAIN=.tanoshimi.dev
SESSION_COOKIE_SECURE=true
FRONTEND_PUBLIC_URL=https://demo02-ferms.tanoshimi.dev
BACKEND_PUBLIC_URL=https://api-demo02-ferms.tanoshimi.dev
SESSION_TTL=12h
```

## 16. 非採用方針

FERMS では以下を採用しない。

- 独自ログイン画面の新設
- フロントエンドのみでの JWT 判定
- `portal_token` の JavaScript 読み取り
- portal と無関係な独自 SSO 基盤

## 17. 結論

FERMS の認証は、`demo01_crm` と同じく **portal の `portal_token` を入口に使い、FERMS 側でローカルセッションを張る handover 方式** とする。  
これにより、`tanoshimi.dev` でのログイン状態をそのまま引き継ぎつつ、FERMS 側では独立した業務 API 保護と将来の権限制御を実現できる。
